import { create } from 'zustand';
import { supabase } from '@/utils/supabase';
import { UserPublicProfileType, FriendRequestType, FriendType, mapRequestFromDB, mapFriendFromDB, BlockedUserType, SentFriendRequestType, ReceivedFriendRequestType } from '@/models';
import { useAuthContext } from '@/contexts';

export type FriendState = {
    pendingSentRequests: SentFriendRequestType[];
    rejectedSentRequests: Set<string>;
    pendingReceivedRequests: ReceivedFriendRequestType[];
    friends: FriendType[];
    blockedUser: BlockedUserType[];
    getBlockedByUser: Set<string>;
    userPublicProfiles: Record<string, UserPublicProfileType>;
    loading: boolean;
};

export type FriendAction = {
    fetchAll: () => Promise<void>;
    sendFriendRequest: (receiverId: string) => Promise<void>;
    acceptFriendRequest: (requestId: string) => Promise<void>;
    rejectFriendRequest: (requestId: string) => Promise<void>;
    subscribeToChanges: () => void;
};

export type FriendStore = FriendState & FriendAction;

export const defaultInitState: FriendState = {
    pendingSentRequests: [],
    rejectedSentRequests: new Set(),
    pendingReceivedRequests: [],
    friends: [],
    blockedUser: [],
    getBlockedByUser: new Set(),
    userPublicProfiles: {},
    loading: false,
};

export const useFriendStore = create<FriendStore>()((set) => ({
    ...defaultInitState,

    fetchAll: async () => {

        const { session } = useAuthContext();
        const userId = session?.user.id;

        const _fetchFriendRequests = async () => {

            const { data, error } = await supabase
                .from('friend_requests')
                .select(`id, sender_id, receiver_id, status`)
                .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
                .in('status', ['pending', 'rejected']);

            if (error) {
                console.error('Error fetching friend requests: ', error.message);
                return;
            }

            const { rejected, received, sent } = data.reduce((r, e) => {
                if (e.sender_id === userId && e.status === 'rejected') {
                    r.rejected.add(e.receiver_id);
                }
                if (e.receiver_id === userId && e.status === 'pending') {
                    r.received.push({ id: e.id, status: e.status, senderId: e.sender_id });
                }
                if (e.sender_id === userId && e.status === 'pending') {
                    r.sent.push({ id: e.id, status: e.status, receiverId: e.receiver_id });
                }
                return r;
            }, { rejected: new Set<string>(), received: [] as ReceivedFriendRequestType[], sent: [] as SentFriendRequestType[] });

            set({ rejectedSentRequests: rejected, pendingSentRequests: sent, pendingReceivedRequests: received });
        };

        const _fetchFriends = async () => {

            const { data, error } = await supabase
                .from('friends')
                .select(`id, friend_id`)
                .eq('user_id', userId);

            if (error) {
                console.error('Error fetching friends: ', error.message);
                return;
            }

            const friends: FriendType[] = mapFriendFromDB(data);

            set({ friends: friends });
        };

        const _fetchBlockedUsers = async () => {

            const { data, error } = await supabase
                .from('blocked_users')
                .select(`id, user_id, blocked_id`)
                .or(`user_id.eq.${userId},blocked_id.eq.${userId}`);

            if (error) {
                console.error('Error fetching blocked users: ', error.message);
                return;
            }

            const { blockedUser, getBlockedByUser } = data.reduce((r, e) => {
                if (e.user_id === userId) {
                    r.blockedUser.push({ id: e.id, blockedId: e.blocked_id });
                }
                if (e.blocked_id === userId) {
                    r.getBlockedByUser.add(e.user_id);
                }
                return r;
            }, { blockedUser: [] as BlockedUserType[], getBlockedByUser: new Set<string>() });

            set({ blockedUser, getBlockedByUser });
        };

        const _fetchUserPublicProfiles = async () => {

            const state = useFriendStore.getState();
            const userIds = new Set([
                ...state.pendingSentRequests.map(e => e.receiverId),
                ...state.pendingReceivedRequests.map(e => e.senderId),
                ...state.friends.map(e => e.friendId),
            ]);

            if (userIds.size === 0) {
                return;
            }

            const { data, error } = await supabase
                .from('user_profiles')
                .select(`user_id, username, name, avatar_uri`)
                .in('user_id', Array.from(userIds));

            if (error) {
                console.error('Error fetching user public profiles: ', error.message);
                set({ loading: false });
                return;
            }

            const userPublicProfiles = data.reduce((acc, user) => {
                acc[user.user_id] = { username: user.username, name: user.name, avatarUri: user.avatar_uri };
                return acc;
            }, {} as Record<string, UserPublicProfileType>);

            set({ userPublicProfiles });
        };


        set({ loading: true });

        await Promise.all([
            _fetchFriendRequests(),
            _fetchFriends(),
            _fetchBlockedUsers(),
        ]);

        await _fetchUserPublicProfiles();

        set({ loading: false });
    },

    sendFriendRequest: async (receiverId) => {

        set({ loading: true });
        const { session } = useAuthContext();
        const userId = session?.user.id;

        const { data, error } = await supabase
            .from('friend_requests')
            .select(`id, sender_id, receiver_id, created_at, status`)
            .eq('sender_id', userId);

        const sentRequests: FriendRequestType[] = mapRequestFromDB(data);

        set({ loading: false });

        if (error) {
            console.error('Error fetching pending request: ', error.message);
            return;
        }
        set((state) => ({ pendingSentRequests: [...state.pendingSentRequests, ...sentRequests] }));
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
            .channel(`friend-changes-${userId}`)
            /**
             * Listen for new friendships (when a friend request is accepted)
             * * Data is inserted automatically into table friends by Trigger Function
             */
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'friends',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    const friends: FriendType[] = mapFriendFromDB([payload.new]);
                    set((state) => ({ friends: [...state.friends, ...friends] }));
                }
            )
            // Listen for updates in friend_requests (when receiver accepts or rejects)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'friend_requests',
                    filter: `sender_id=eq.${userId}`
                },
                (payload) => {
                    console.log('Friend request updated:', payload.new);

                    set((state) => ({
                        pendingSentRequests: state.pendingSentRequests.map((req) =>
                            req.id === payload.new.id ? { ...req, status: payload.new.status } : req
                        ),
                    }));
                }
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    },
}));