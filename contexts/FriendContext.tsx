import React, { useState, createContext, useContext, useMemo, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { Session } from '@supabase/supabase-js';
import { useAuthContext } from './AuthContext';

type Friend = {
    id: string;
    user_id: string;
    friend_id: string;
    status: string;
    created_at: string;
};

interface IFriendContextProps {
    friends: Friend[] | null;
    pendingRequest: Friend[] | null;
    receivedRequest: Friend[] | null;
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
            .channel('friends-updates')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'friends',
                filter: `user_id=eq.${userId}`,
            }, (payload) => {
                console.log("added");
                setPendingRequest((prev) => [...prev, payload.new as Friend]);
            })
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'friends',
                filter: `friend_id=eq.${userId}`,
            }, (payload) => {
                console.log("added");
                setReceivedRequest((prev) => [...prev, payload.new as Friend]);
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'friends',
                filter: `user_id=eq.${userId},status=eq.accepted`,
            }, (payload) => {
                console.log("update");
                setFriends((prev) => [...prev, payload.new as Friend]);
                setPendingRequest((prev) => prev.filter((e) => e.friend_id !== payload.new.friend_id));
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'friends',
                filter: `friend_id=eq.${userId},status=eq.accepted`,
            }, (payload) => {
                console.log("update");
                setFriends((prev) => [...prev, payload.new as Friend]);
                setReceivedRequest((prev) => prev.filter((e) => e.friend_id !== payload.new.friend_id));
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'friends',
                filter: `friend_id=eq.${userId},status=eq.rejected`,
            }, (payload) => {
                console.log("update");
                setReceivedRequest((prev) => prev.filter((e) => e.friend_id !== payload.new.friend_id));
            })
            .on('postgres_changes', {
                event: 'DELETE',
                schema: 'public',
                table: 'friends',
                filter: `user_id=eq.${userId}`,
            }, (payload) => {
                console.log("delete");
                setFriends((prev) => prev.filter((e) => e.friend_id !== payload.old.user_id));
            })
            .on('postgres_changes', {
                event: 'DELETE',
                schema: 'public',
                table: 'friends',
                filter: `friend_id=eq.${userId}`,
            }, (payload) => {
                console.log("delete");
                setFriends((prev) => prev.filter((e) => e.friend_id !== payload.old.friend_id));
            })
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, []);

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
        setPendingRequest(pendingList);
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
        setReceivedRequest(receivedList);
    };

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
        setFriends(friendsList);
    };

    const handleAddFriend = async (friendId: string) => {
        const userId = session?.user.id;
        if (userId === friendId) return;
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