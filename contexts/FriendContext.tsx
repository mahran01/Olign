import { supabase } from '@/utils/supabase';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuthContext } from './AuthContext';
import { useUserContext } from './UserContext';

type Friend = {
    id: string;
    user_id: string;
    user_name?: string;
    friend_id: string;
    friend_name?: string;
    status: string;
    created_at: string;
    last_status_update: string;
};

interface IFriendContextProps {
    friends: Friend[];
    pendingRequest: Friend[];
    receivedRequest: Friend[];
    handleAddFriend: (friendId: string) => Promise<void>;
    handleAcceptRequest: (friendId: string) => Promise<void>;
    handleRejectRequest: (friendId: string) => Promise<void>;
    handleRemoveFriend: (friendId: string) => Promise<void>;
    loading: boolean;
}

export const FriendContext = createContext<IFriendContextProps>({
    friends: [],
    pendingRequest: [],
    receivedRequest: [],
    handleAddFriend: async () => { },
    handleAcceptRequest: async () => { },
    handleRejectRequest: async () => { },
    handleRemoveFriend: async () => { },
    loading: false,
});

export const FriendProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const { session } = useAuthContext();
    const { getNameByUserId } = useUserContext();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [pendingRequest, setPendingRequest] = useState<Friend[]>([]);
    const [receivedRequest, setReceivedRequest] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);

    // Use effect intialization
    useEffect(() => {
        const fetchUserData = async () => {
            if (!session) return;
            await _fetchFriends();
            await _fetchPendingRequest();
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
                    setPendingRequest((prev) => [...prev, { ...payload.new, user_name: userName, friend_name: friendName } as Friend]);
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
                    setPendingRequest((prev) => prev.filter((e) => e.friend_id !== payload.new.friend_id));
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

    const _fetchFriends = async () => {
        setLoading(true);
        const userId = session?.user.id;
        const { data: friendsList, error: friendsError } = await supabase
            .from('friends')
            .select('*')
            .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
            .eq('status', 'accepted');
        setLoading(false);
        if (friendsError) {
            console.error('Error fetching friends:', friendsError.message);
            return;
        }

        setFriends(await Promise.all(
            friendsList.map(async (friend) => ({
                ...friend,
                user_name: await getNameByUserId(friend.user_id),
                friend_name: await getNameByUserId(friend.friend_id),
            }))
        ));
    };

    const _fetchPendingRequest = async () => {
        setLoading(true);
        const userId = session?.user.id;
        const { data: pendingList, error: friendsError } = await supabase
            .from('friends')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'pending');
        setLoading(false);
        if (friendsError) {
            console.error('Error fetching pending request: ', friendsError.message);
            return;
        }
        setPendingRequest(await Promise.all(
            pendingList.map(async (friend) => ({
                ...friend,
                user_name: await getNameByUserId(friend.user_id),
                friend_name: await getNameByUserId(friend.friend_id),
            }))
        ));
    };

    const _fetchReceivedRequest = async () => {
        setLoading(true);
        const userId = session?.user.id;
        const { data: receivedList, error: friendsError } = await supabase
            .from('friends')
            .select('*')
            .eq('friend_id', userId)
            .eq('status', 'pending');
        setLoading(false);
        if (friendsError) {
            console.error('Error fetching received request: ', friendsError.message);
            return;
        }
        setReceivedRequest(await Promise.all(
            receivedList.map(async (friend) => ({
                ...friend,
                user_name: await getNameByUserId(friend.user_id),
                friend_name: await getNameByUserId(friend.friend_id),
            }))
        ));
    };

    const handleAddFriend = async (friendId: string) => {
        const userId = session?.user.id;
        if (userId === friendId) return;

        const { data: existingFriends, error: checkError } = await supabase
            .from('friends')
            .select('id') // Only select the ID to minimize data load
            .or(`user_id.eq.${userId},and(friend_id.eq.${friendId}),user_id.eq.${friendId},and(friend_id.eq.${userId})`);

        console.log(`User Id: ${userId} and Friend Id: ${friendId}`);
        console.log(existingFriends);


        if (checkError) {
            console.error('Error checking existing friends:', checkError.message);
            return;
        }
        if (existingFriends.length > 0) {
            console.log('Friend already exists');
            return; // Exit if a record already exists
        }

        const { data: addedFriend, error: addError } = await supabase
            .from('friends')
            .insert({ friend_id: friendId });
        setLoading(false);
        if (addError) {
            console.error('Error adding friend:', addError.message);
            return;
        }
    };

    const handleAcceptRequest = async (friendId: string) => {
        setLoading(true);
        const userId = session?.user.id;
        const { data: updatedFriend, error: updateError } = await supabase
            .from('friends')
            .update({ status: 'accepted' })
            .eq('user_id', userId)
            .eq('friend_id', friendId);
        setLoading(false);
        if (updateError) {
            console.error('Error accepting request:', updateError.message);
            return;
        }
    };

    const handleRejectRequest = async (friendId: string) => {
        setLoading(true);
        const userId = session?.user.id;
        const { data: rejectFriend, error: rejectError } = await supabase
            .from('friends')
            .update({ status: 'rejected' })
            .eq('user_id', userId)
            .eq('friend_id', friendId)
            .select('*');
        setLoading(false);
        if (rejectError) {
            console.error('Error removing friend:', rejectError.message);
            return;
        }
    };

    const handleRemoveFriend = async (friendId: string) => {
        setLoading(true);
        const userId = session?.user.id;
        const { data: removedFriend, error: removeError } = await supabase
            .from('friends')
            .delete()
            .eq('user_id', userId)
            .eq('friend_id', friendId)
            .select('*');
        setLoading(false);
        if (removeError) {
            console.error('Error removing friend:', removeError.message);
            return;
        }
    };

    const value = useMemo(
        () => ({
            friends,
            pendingRequest,
            receivedRequest,
            handleAddFriend,
            handleAcceptRequest,
            handleRejectRequest,
            handleRemoveFriend,
            loading
        }),
        [
            friends,
            pendingRequest,
            receivedRequest,
            handleAddFriend,
            handleAcceptRequest,
            handleRejectRequest,
            handleRemoveFriend,
            loading,
        ]
    );

    return (
        <FriendContext.Provider value={value}>
            {children}
        </FriendContext.Provider>
    );
};

export const useFriendContext = () => {
    const context = useContext(FriendContext);
    if (!context) {
        throw new Error('useFriendContext must be used within a Friend Provider');
    }
    return context;
};