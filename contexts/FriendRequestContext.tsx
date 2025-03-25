import { ReceivedFriendRequestType, SentFriendRequestType } from '@/models';
import { supabase } from '@/utils/supabase';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuthContext } from './AuthContext';

interface IFriendRequestContextProps {
    sentRequest: SentFriendRequestType[];
    receivedRequest: ReceivedFriendRequestType[];
    handleSendRequest: (friendId: string) => Promise<void>;
    handleAcceptRequest: (friendId: string) => Promise<void>;
    handleRejectRequest: (friendId: string) => Promise<void>;
    loading: boolean;
}

export const FriendRequestContext = createContext<IFriendRequestContextProps>({
    sentRequest: [],
    receivedRequest: [],
    handleSendRequest: async () => { },
    handleAcceptRequest: async () => { },
    handleRejectRequest: async () => { },
    loading: false,
});

export const FriendProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const { session } = useAuthContext();
    const [sentRequest, setSentRequest] = useState<SentFriendRequestType[]>([]);
    const [receivedRequest, setReceivedRequest] = useState<ReceivedFriendRequestType[]>([]);
    const [loading, setLoading] = useState(true);

    // Use effect intialization
    useEffect(() => {
        const fetchUserData = async () => {
            if (!session) return;
            await _fetchSentRequest();
            await _fetchReceivedRequest();
        };
        fetchUserData();
    }, []);

    // Use effect for postgre change
    useEffect(() => {
        const userId = session?.user.id;
        if (!userId) return;

        const channel = supabase
            .channel(`friends-updates-${userId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'friends' }, async (payload) => {
                const userName = await getNameByUserId(payload.new.user_id);
                const friendName = await getNameByUserId(payload.new.friend_id);
                if (payload.new.user_id === userId) {
                    console.log("added to pending requests");
                    setSentRequest((prev) => [...prev, { ...payload.new, user_name: userName, friend_name: friendName } as Friend]);
                } else if (payload.new.friend_id === userId) {
                    console.log("added to received requests");
                    setReceivedRequest((prev) => [...prev, { ...payload.new, user_name: userName, friend_name: friendName } as Friend]);
                }
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'friends' }, async (payload) => {
                const userName = await getNameByUserId(payload.new.user_id);
                const friendName = await getNameByUserId(payload.new.friend_id);
                if (payload.new.status === "accepted") {
                    console.log("friend request accepted");
                    setFriends((prev) => [...prev, { ...payload.new, user_name: userName, friend_name: friendName } as Friend]);
                    setSentRequest((prev) => prev.filter((e) => e.friend_id !== payload.new.friend_id));
                    setReceivedRequest((prev) => prev.filter((e) => e.friend_id !== payload.new.friend_id));
                } else if (payload.new.status === "rejected") {
                    console.log("friend request rejected");
                    setReceivedRequest((prev) => prev.filter((e) => e.friend_id !== payload.new.friend_id));
                }
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'friends' }, (payload) => {
                console.log("friendship deleted");
                setFriends((prev) => prev.filter((e) => e.friend_id !== payload.old.friend_id && e.friend_id !== payload.old.user_id));
            })
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, []);

    const _fetchSentRequest = async () => {
        setLoading(true);
        const userId = session?.user.id;

        const { data, error } = await supabase
            .from('friend_requests')
            .select(`
            id, status, created_at, receiver_id,
            receiverPublicProfile: user_profiles!friend_requests_receiver_id_fkey(username, name, avatar_uri)
            `)
            .eq('sender_id', userId);

        const sentRequests: SentFriendRequestType[] = data?.map(req => ({
            ...req,
            createdAt: new Date(req.created_at),
            receiverPublicProfile: req.receiverPublicProfile[0] // Convert to Date object if needed
        })) || [];

        setLoading(false);

        if (error) {
            console.error('Error fetching pending request: ', error.message);
            return;
        }
        setSentRequest(sentRequests);
    };

    const _fetchReceivedRequest = async () => {
        setLoading(true);
        const userId = session?.user.id;

        const { data, error } = await supabase
            .from('friend_requests')
            .select(`
            id, status, created_at, sender_id,
            senderPublicProfile: user_profiles!friend_requests_sender_id_fkey(username, name, avatar_uri)
            `)
            .eq('receiver_id', userId);

        const receivedRequests: ReceivedFriendRequestType[] = data?.map(req => ({
            ...req,
            createdAt: new Date(req.created_at),
            senderPublicProfile: req.senderPublicProfile[0] // Convert to Date object if needed
        })) || [];

        setLoading(false);

        if (error) {
            console.error('Error fetching pending request: ', error.message);
            return;
        }
        setReceivedRequest(receivedRequests);
    };

    const handleSendRequest = async (id: string) => {
        // Local-side check
        const userId = session?.user.id;
        if (userId === id) return;
        if (receivedRequest.find((e) => e.sender_id === id)) return;
        if (sentRequest.find((e) => e.receiver_id === id)) return;

        // Server-side check
        const { data: existingRequests, error: checkError } = await supabase
            .from('friend_requests')
            .select('id')
            .or(`user_id.eq.${userId},and(friend_id.eq.${id}),user_id.eq.${id},and(friend_id.eq.${userId})`);

        if (checkError) {
            console.error('Error checking existing friends:', checkError.message);
            return;
        }
        if (existingRequests.length > 0) {
            console.log('Friend already exists');
            return;
        }

        const { data, error } = await supabase
            .from('friend_requests')
            .insert({ friend_id: id });

        if (error) {
            console.error('Error adding friend:', error.message);
            return;
        }
    };

    const handleAcceptRequest = async (requestId: string) => {
        setLoading(true);
        const userId = session?.user.id;
        const { data, error } = await supabase
            .from('friend_requests')
            .update({ status: 'accepted' })
            .eq('user_id', userId)
            .eq('id', requestId);
        setLoading(false);
        if (error) {
            console.error('Error accepting request:', error.message);
            return;
        }
    };

    const handleRejectRequest = async (id: string) => {
        setLoading(true);
        const userId = session?.user.id;
        const { data, error } = await supabase
            .from('friend_requests')
            .update({ status: 'rejected' })
            .eq('user_id', userId)
            .eq('id', id);
        setLoading(false);
        if (error) {
            console.error('Error rejecting request:', error.message);
            return;
        }
    };

    const value = useMemo(
        () => ({
            sentRequest,
            receivedRequest,
            handleSendRequest,
            handleAcceptRequest,
            handleRejectRequest,
            loading
        }),
        [
            sentRequest,
            receivedRequest,
            handleSendRequest,
            handleAcceptRequest,
            handleRejectRequest,
            loading,
        ]
    );

    return (
        <FriendRequestContext.Provider value={value}>
            {children}
        </FriendRequestContext.Provider>
    );
};

export const useFriendRequestContext = () => {
    const context = useContext(FriendRequestContext);
    if (!context) {
        throw new Error('useFriendRequestContext must be used within a Friend Request Provider');
    }
    return context;
};