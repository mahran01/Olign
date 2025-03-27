import { create } from 'zustand';
import { supabase } from '@/utils/supabase';
import { UserPublicProfileType, FriendRequestType as DirtyFriendRequestType, FriendType } from '@/models';
import { useAuthContext } from '@/contexts';

type FriendRequestType = Omit<DirtyFriendRequestType, 'rejectedAt'>;

export type FriendState = {
    friends: FriendType[];
    sentRequests: FriendRequestType[];
    receivedRequests: FriendRequestType[];
    userPublicProfiles: UserPublicProfileType[];
    loading: boolean;
};

export type FriendAction = {
    fetchFriends: () => Promise<void>;
    sendFriendRequest: (receiverId: string) => Promise<void>;
    acceptFriendRequest: (requestId: string) => Promise<void>;
    rejectFriendRequest: (requestId: string) => Promise<void>;
    subscribeToChanges: () => void;
};

export type FriendStore = FriendState & FriendAction;

export const defaultInitState: FriendState = {
    friends: [],
    sentRequests: [],
    receivedRequests: [],
    userPublicProfiles: [],
    loading: false,
};

export const useFriendStore = create<FriendStore>()((set) => ({
    ...defaultInitState,

    fetchFriends: async () => {
        //TODO
    },

    sendFriendRequest: async (receiverId) => {

        set({ loading: true });
        const { session } = useAuthContext();
        const userId = session?.user.id;

        const { data, error } = await supabase
            .from('friend_requests')
            .select(`id, sender_id, receiver_id, created_at, status`)
            .eq('sender_id', userId);

        const sentRequests: FriendRequestType[] = data?.map(req => ({
            ...req,
            senderId: req.sender_id,
            receiverId: req.receiver_id,
            createdAt: new Date(req.created_at),
        })) || [];

        set({ loading: false });

        if (error) {
            console.error('Error fetching pending request: ', error.message);
            return;
        }
        set((state) => ({
            sentRequests: [...state.sentRequests, ...sentRequests],
        }));
    },

    acceptFriendRequest: async (requestId) => {

        set({ loading: true });

        const { data, error } = await supabase
            .from('friend_requests')
            .update({ status: 'accepted' })
            .eq('id', requestId);

        set({ loading: false });

        if (error) {
            console.error('Error accepting request:', error.message);
            return;
        }
    },

    rejectFriendRequest: async (requestId) => {

        set({ loading: true });

        const { data, error } = await supabase
            .from('friend_requests')
            .update({ status: 'rejected' })
            .eq('id', requestId);

        set({ loading: false });

        if (error) {
            console.error('Error rejecting request:', error.message);
            return;
        }
    },

    subscribeToChanges: () => {

        set({ loading: true });
        const { session } = useAuthContext();
        const userId = session?.user.id;

        //TODO
        const channel = supabase
            .channel(`friend-requests-changes-${userId}`)
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    },
}));