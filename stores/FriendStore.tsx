import { create } from 'zustand';
import { supabase } from '@/utils/supabase';
import {
    UserPublicProfileType,
    FriendRequestType,
    FriendType,
    mapRequestFromDB,
    mapFriendFromDB,
    BlockedUserType,
    SentFriendRequestType,
    ReceivedFriendRequestType,
    mapBlockedUserFromDB
} from '@/models';

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
    fetchAll: (session: any) => Promise<void>;
    fetchUserPublicProfile: (userId: string) => Promise<UserPublicProfileType>;
    sendFriendRequest: (receiverId: string, receiverPublicProfile: UserPublicProfileType, session: any) => Promise<void>;
    acceptFriendRequest: (requestId: string) => Promise<void>;
    rejectFriendRequest: (requestId: string) => Promise<void>;
    removeFriendRequest: (requestId: string) => Promise<void>;
    cancelFriendRequest: (requestId: string) => Promise<void>;
    getRequestIdFromUserId: (anotherUserId: string) => string;
    removeFriend: (friendId: string, session: any) => Promise<void>;
    blockUser: (blockedId: string, blockedPublicProfile: UserPublicProfileType, session: any) => Promise<void>;
    subscribeToChanges: (session: any) => void;
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

    fetchAll: async (session) => {
        const userId = session.user.id;

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

    sendFriendRequest: async (receiverId, receiverPublicProfile, session) => {

        set({ loading: true });
        console.log('Receiver ID:', receiverId);

        const userId = session.user.id;

        const state = get();

        if (userId === receiverId ||
            state.getBlockedByUser.has(receiverId) ||
            state.rejectedSentRequests.has(receiverId) ||
            state.pendingSentRequests.some(e => e.receiverId === receiverId) ||
            state.friends.some(e => e.friendId === receiverId)) {

            console.error('Error sending friend request: Already a friend or pending request or rejected request or get blocked by receiver');
            return;
        }

        const { data, error } = await supabase
            .from('friend_requests')
            .insert({ receiver_id: receiverId })
            .select();

        set({ loading: false });

        if (error) {
            console.error('Error inserting friend request: ', error.message);
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

        const { data, error } = await supabase
            .from('friend_requests')
            .update({ status: 'rejected' })
            .eq('id', requestId);

        if (error) {
            console.error('Error rejecting request:', error.message);
            return;
        }


        set((state) => {
            const rejectedRequest = state.pendingReceivedRequests.find(e => e.id === requestId);
            const rejectedUserId = rejectedRequest?.senderId;

            const { [rejectedUserId!]: _, ...updatedUserPublicProfiles } = state.userPublicProfiles;

            return {
                pendingSentRequests: state.pendingSentRequests.filter(e => e.id !== requestId),
                userPublicProfiles: updatedUserPublicProfiles
            };
        });
    },

    /**
     * Only use this to remove request or to remove buggy request
     * * Don't use outside of this file *
     */
    removeFriendRequest: async (requestId) => {

        set({ loading: true });

        const { error } = await supabase
            .from('friend_requests')
            .delete()
            .eq('id', requestId);

        if (error) {
            throw new Error('Error removing friend request: ' + error.message);
        }
    },

    cancelFriendRequest: async (requestId) => {

        set({ loading: true });

        const { removeFriendRequest, pendingSentRequests, userPublicProfiles } = get();

        try {
            await get().removeFriendRequest(requestId);
            const request = pendingSentRequests.find(e => e.id === requestId);

            if (request) {
                const { receiverId } = request;

                let updatedUserPublicProfiles = userPublicProfiles;
                if (receiverId in userPublicProfiles) {
                    const { [receiverId!]: _, ...rest } = userPublicProfiles;
                    updatedUserPublicProfiles = rest;
                }

                set({
                    pendingSentRequests: pendingSentRequests.filter(e => e.id !== requestId),
                    userPublicProfiles: updatedUserPublicProfiles
                });
            }
        } catch (e: any) {
            console.log(e.message);
        }
    },

    getRequestIdFromUserId: (anotherUserId) => {

        const { pendingSentRequests, pendingReceivedRequests } = get();

        // Find in sent requests
        const sentRequest = pendingSentRequests.find(e => e.receiverId === anotherUserId);
        if (sentRequest) return sentRequest.id;

        // Find in received requests
        const receivedRequest = pendingReceivedRequests.find(e => e.senderId === anotherUserId);
        if (receivedRequest) return receivedRequest.id;

        return '';
    },

    removeFriend: async (friendId, session) => {

        set({ loading: true });

        const userId = session.user.id;

        const { error: friendsErr } = await supabase
            .from('friends')
            .delete()
            .or(`(user_id.eq.${userId},friend_id.eq.${friendId}),(user_id.eq.${friendId},friend_id.eq.${userId})`);

        if (friendsErr) {
            throw new Error(`Error removing friend: ${friendsErr?.message}`);
        }
    },

    blockUser: async (blockedId, blockedPublicProfile, session) => {

        set({ loading: true });

        const userId = session.user.id;

        const {
            userPublicProfiles,
            blockedUser,
            pendingSentRequests,
            pendingReceivedRequests,
            friends,
            removeFriendRequest,
            removeFriend,
            cancelFriendRequest
        } = get();

        if (userId === blockedId) {
            console.error('Cannot block self');
            return;
        }
        const existingBlock = blockedUser.find(e => e.blockedId === blockedId);
        if (existingBlock) {
            console.error('User is already blocked');
            return;
        }
        // Only check when they are among friends, pending request or blocked users
        if (blockedId in userPublicProfiles) {

            let sentRequest, receivedRequest, friend;

            if (sentRequest = pendingSentRequests.find(e => e.receiverId === blockedId))
                cancelFriendRequest(sentRequest.id);
            else if (receivedRequest = pendingReceivedRequests.find(e => e.senderId === blockedId))
                removeFriendRequest(receivedRequest.id);
            else if (friend = friends.find(e => e.friendId === blockedId))
                removeFriend(friend.id, session);
        }

        const { data, error } = await supabase
            .from('blocked_users')
            .insert({ blocked_id: blockedId })
            .select();

        set({ loading: false });

        if (error) {
            console.error('Error blocking user: ', error.message);
            return;
        }

        if (!data || data.length === 0) {
            console.error('No data returned from blocking user');
            return;
        }

        const blockedUsers = mapBlockedUserFromDB(data);
        set((state) => ({
            blockedUser: [...state.blockedUser, ...blockedUsers],
            userPublicProfiles: {
                ...state.userPublicProfiles,
                [blockedId]: blockedPublicProfile
            }
        }));
    },

    subscribeToChanges: (session: any) => {

        const userId = session.user.id;

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

                    const profile = await get().fetchUserPublicProfile(senderId);
                    set((state) => ({
                        pendingReceivedRequests: [...state.pendingReceivedRequests, { id: requestId, senderId, status }],
                        userPublicProfiles: {
                            ...state.userPublicProfiles,
                            [senderId]: profile,
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
            // Listen for delete in friends for both user and deleted friend
            // * Since friend is bi-directional, only need to listen 
            // * to user_id to prevent redundant delete for one user
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'friends',
                    filter: `user_id=eq.${userId}`
                },
                async (payload) => {

                    const { id: friendship_id } = payload.old;
                    const friendId = get().friends.find(e => e.id === friendship_id)?.friendId;

                    if (friendId) {

                        set((state) => {

                            const updatedUserPublicProfiles = friendId in state.userPublicProfiles
                                ? (({ [friendId]: _, ...rest }) => rest)(state.userPublicProfiles)
                                : state.userPublicProfiles;

                            return {
                                friends: state.friends.filter(e => e.id === friendship_id),
                                userPublicProfiles: updatedUserPublicProfiles
                            };
                        });
                    }
                }
            )
            // Listen for delete in friendRequests for receiver
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'friend_requests',
                    filter: `receiver_id=eq.${userId}`
                },
                async (payload) => {

                    const { id: requestId } = payload.old;
                    const senderId = get().pendingReceivedRequests.find(e => e.id === requestId)?.senderId;

                    if (senderId) {
                        console.log("Inside condition");

                        set((state) => {

                            let updatedUserPublicProfiles = state.userPublicProfiles;

                            if (senderId in state.userPublicProfiles) {
                                const { [senderId!]: _, ...rest } = state.userPublicProfiles;
                                updatedUserPublicProfiles = rest;
                            }

                            console.log('Raw data from insert:', updatedUserPublicProfiles);
                            console.log('Mapped sentRequests:', state.pendingSentRequests.filter(e => e.id !== requestId));

                            return {
                                pendingSentRequests: state.pendingSentRequests.filter(e => e.id !== requestId),
                                userPublicProfiles: updatedUserPublicProfiles
                            };
                        });
                    }
                }

            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    },
}));