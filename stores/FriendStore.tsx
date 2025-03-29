import { create } from 'zustand';
import { supabase } from '@/utils/supabase';
import { UserPublicProfileType, FriendRequestType, FriendType, mapRequestFromDB, mapFriendFromDB, BlockedUserType, SentFriendRequestType, ReceivedFriendRequestType, mapBlockedUserFromDB } from '@/models';
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
    fetchUserPublicProfile: (userId: string) => Promise<UserPublicProfileType>;
    sendFriendRequest: (receiverId: string, receiverPublicProfile: UserPublicProfileType) => Promise<void>;
    acceptFriendRequest: (requestId: string) => Promise<void>;
    rejectFriendRequest: (requestId: string) => Promise<void>;
    blockUser: (blockedId: string, blockedPublicProfile: UserPublicProfileType) => Promise<void>;
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

export const useFriendStore = create<FriendStore>()((set, get) => ({
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
                throw new Error('Error fetching friend requests: ' + error.message);
            }

            const { rejected, received, sent } = data.reduce((r, e) => {
                if (e.sender_id === userId && e.status === 'rejected') {
                    r.rejected.add(e.receiver_id);
                }
                else if (e.receiver_id === userId && e.status === 'pending') {
                    r.received.push({ id: e.id, status: e.status, senderId: e.sender_id });
                }
                else if (e.sender_id === userId && e.status === 'pending') {
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
                throw new Error('Error fetching friends: ' + error.message);
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
                throw new Error('Error fetching blocked users: ' + error.message);
            }

            const { blockedUser, getBlockedByUser } = data.reduce((r, e) => {
                if (e.user_id === userId) {
                    r.blockedUser.push({ id: e.id, blockedId: e.blocked_id });
                }
                else if (e.blocked_id === userId) {
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
                throw new Error('Error fetching user public profiles: ' + error.message);
            }

            const userPublicProfiles = data.reduce((acc, user) => {
                acc[user.user_id] = { username: user.username, name: user.name, avatarUri: user.avatar_uri };
                return acc;
            }, {} as Record<string, UserPublicProfileType>);

            set({ userPublicProfiles });
        };

        try {
            await Promise.all([
                _fetchFriendRequests(),
                _fetchFriends(),
                _fetchBlockedUsers(),
            ]);

            await _fetchUserPublicProfiles();

        } catch (error) {
            console.error(error);
            set({ loading: false });
            return;
        }

        set({ loading: false });
    },

    fetchUserPublicProfile: async (userId: string) => {
        set({ loading: true });

        const { data, error } = await supabase
            .from('user_profiles')
            .select(`username, name, avatar_uri`)
            .eq('user_id', userId)
            .single();

        set({ loading: false });

        if (error) {
            throw new Error('Error fetching user public profiles:' + error.message);
        }

        return { username: data.username, name: data.name, avatarUri: data.avatar_uri };
    },

    sendFriendRequest: async (receiverId, receiverPublicProfile) => {

        set({ loading: true });

        const userId = useAuthContext().session?.user.id;

        if (userId === receiverId ||
            get().getBlockedByUser.has(receiverId) ||
            get().rejectedSentRequests.has(receiverId) ||
            get().pendingSentRequests.some(e => e.receiverId === receiverId) ||
            get().friends.some(e => e.friendId === receiverId)) {

            console.error('Error sending friend request: Already a friend or pending request or rejected request or get blocked by receiver');
            return;
        }

        const { data, error } = await supabase
            .from('friend_requests')
            .insert({ receiver_id: receiverId });

        set({ loading: false });

        if (error) {
            console.error('Error fetching pending request: ', error.message);
            return;
        }

        const sentRequests: FriendRequestType[] = mapRequestFromDB(data);
        set((state) => ({
            pendingSentRequests: [...state.pendingSentRequests, ...sentRequests],
            userPublicProfiles: {
                ...state.userPublicProfiles,
                [receiverId]: receiverPublicProfile
            }
        }));
    },

    acceptFriendRequest: async (requestId) => {

        set({ loading: true });

        const { error } = await supabase
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

        const { error } = await supabase
            .from('friend_requests')
            .update({ status: 'rejected' })
            .eq('id', requestId);

        set({ loading: false });

        if (error) {
            console.error('Error rejecting request:', error.message);
            return;
        }
    },

    //TODO - Check for various conditions e.g. (block, ongoing request, friend) and respond accordingly.
    blockUser: async (blockedId, blockedPublicProfile) => {

        set({ loading: true });

        const { data, error } = await supabase
            .from('blocked_users')
            .insert({ blocked_id: blockedId });

        set({ loading: false });

        if (error) {
            console.error('Error blocking user: ', error.message);
            return;
        }

        const blockedUser = mapBlockedUserFromDB(data);
        set((state) => ({
            blockedUser: [...state.blockedUser, ...blockedUser],
            userPublicProfiles: {
                ...state.userPublicProfiles,
                [blockedId]: blockedPublicProfile
            }
        }));
    },

    subscribeToChanges: () => {

        set({ loading: true });
        const { session } = useAuthContext();
        const userId = session?.user.id;

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
            // Listen for updates in friend_requests for sender (when receiver accepts or rejects)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'friend_requests',
                    filter: `sender_id=eq.${userId}`
                },
                (payload) => {
                    const { id: requestId, status } = payload.new;

                    if (!requestId || status === 'pending') return;

                    else if (status === 'accepted' || status === 'rejected') {
                        set((state) => ({
                            pendingSentRequests: state.pendingSentRequests.filter(e => e.id !== requestId),
                        }));
                    }
                }
            )
            // Listen for insert in friend_requests for receiver (When sender send request)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'friend_requests',
                    filter: `receiver_id=eq.${userId}`
                },
                async (payload) => {
                    const { id: requestId, sender_id: senderId, status } = payload.new;
                    if (!requestId || status !== 'pending') return;

                    const { data, error } = await supabase
                        .from('user_profiles')
                        .select(`username, name, avatar_uri`)
                        .eq('user_id', senderId)
                        .single();

                    if (error) {
                        console.error('Error fetching user public profiles:', error.message);
                        return;
                    }

                    set((state) => ({
                        pendingReceivedRequests: [...state.pendingReceivedRequests, { id: requestId, senderId, status }],
                        userPublicProfiles: {
                            ...state.userPublicProfiles,
                            [senderId]: state.fetchUserPublicProfile(senderId),
                        }
                    }));
                }
            )
            // Listen for insert in bloked_users for blocked user (When others block user)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'blocked_users',
                    filter: `blocked_id=eq.${userId}`
                },
                async (payload) => {
                    const { user_id: getBlockedById } = payload.new;
                    if (!getBlockedById) return;

                    set((state) => ({
                        getBlockedByUser: new Set<string>([...state.getBlockedByUser, getBlockedById]),
                    }));
                }
            )

            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    },
}));