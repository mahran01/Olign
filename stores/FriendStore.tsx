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
    mapBlockedUserFromDB,
    FriendRequestStatusType
} from '@/models';

export type FriendState = {
    pendingSentRequests: SentFriendRequestType[];
    pendingReceivedRequests: ReceivedFriendRequestType[];
    friends: FriendType[];
    blockedUsers: BlockedUserType[];
    getBlockedByUsers: Set<string>;
    userPublicProfiles: Record<string, UserPublicProfileType>;
    loading: boolean;
    toastMessage: { type?: "error" | "success" | "warning" | "info" | "small" | "smallErr", title: string, message?: string; } | null;
};

export type FriendAction = {
    resetToastMessage: () => void;
    fetchAll: (session: any) => Promise<void>;
    fetchUserPublicProfile: (param:
        | { userId: string; username?: never; }
        | { userId?: never; username: string; }
    ) => Promise<UserPublicProfileType>;
    sendFriendRequest: (receiverId: string, receiverPublicProfile: UserPublicProfileType, session: any) => Promise<void>;
    acceptFriendRequest: (requestId: string) => Promise<void>;
    rejectFriendRequest: (requestId: string) => Promise<void>;
    _removeFriendRequest: (requestId: string) => Promise<void>;
    _updateFriendRequest: (requestId: string, status: FriendRequestStatusType) => Promise<void>;
    cancelFriendRequest: (requestId: string) => Promise<void>;
    _getRequestIdFromUserId: (anotherUserId: string) => string;
    removeFriend: (friendId: string, session: any) => Promise<void>;
    blockUser: (blockedId: string, blockedPublicProfile: UserPublicProfileType, session: any) => Promise<void>;
    subscribeToChanges: (session: any) => void;
};

export type FriendStore = FriendState & FriendAction;

export const defaultInitState: FriendState = {
    pendingSentRequests: [],
    pendingReceivedRequests: [],
    friends: [],
    blockedUsers: [],
    getBlockedByUsers: new Set(),
    userPublicProfiles: {},
    loading: false,
    toastMessage: null
};

export const useFriendStore = create<FriendStore>()((set, get) => ({
    ...defaultInitState,

    resetToastMessage: () => {
        set({ toastMessage: null });
    },

    fetchAll: async (session) => {
        const userId = session.user.id;

        const _fetchPendingRequests = async () => {

            const { data, error } = await supabase
                .from('friend_requests')
                .select(`id, sender_id, receiver_id, status`)
                .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
                .eq('status', 'pending');

            if (error) {
                throw new Error('Error fetching friend requests: ' + error.message);
            }

            const { received, sent } = data.reduce((r, e) => {
                if (e.receiver_id === userId && e.status === 'pending') {
                    r.received.push({ id: e.id, status: e.status, senderId: e.sender_id });
                }
                else if (e.sender_id === userId && e.status === 'pending') {
                    r.sent.push({ id: e.id, status: e.status, receiverId: e.receiver_id });
                }
                return r;
            }, { received: [] as ReceivedFriendRequestType[], sent: [] as SentFriendRequestType[] });

            set({ pendingSentRequests: sent, pendingReceivedRequests: received });
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

            const { blockedUsers, getBlockedByUsers } = data.reduce((r, e) => {
                if (e.user_id === userId) {
                    r.blockedUsers.push({ id: e.id, blockedId: e.blocked_id });
                }
                else if (e.blocked_id === userId) {
                    r.getBlockedByUsers.add(e.user_id);
                }
                return r;
            }, { blockedUsers: [] as BlockedUserType[], getBlockedByUsers: new Set<string>() });

            set({ blockedUsers, getBlockedByUsers });
        };

        const _fetchUserPublicProfiles = async () => {

            const state = get();
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
                _fetchPendingRequests(),
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

    fetchUserPublicProfile: async ({ userId, username }) => {
        set({ loading: true });

        const { data, error } = await supabase
            .from('user_profiles')
            .select(`username, name, avatar_uri`)
            .eq(userId ? 'user_id' : username ? 'username' : '', userId || username)
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

        if (userId === receiverId) {
            set({
                loading: false,
                toastMessage: {
                    type: 'error',
                    title: 'Error sending friend request',
                    message: 'You cannot send a friend request to yourself.'
                }
            });
            return;
        }
        if (state.getBlockedByUsers.has(receiverId)) {
            set({
                loading: false,
                toastMessage: {
                    type: 'error',
                    title: 'Error sending friend request',
                    message: 'User cannot be found'
                }
            });
            return;
        }
        if (state.blockedUsers.some(e => e.blockedId === receiverId)) {
            set({
                loading: false,
                toastMessage: {
                    type: 'error',
                    title: 'Error sending friend request',
                    message: 'You need to unblock the user first.'
                }
            });
            return;
        }
        if (state.pendingSentRequests.some(e => e.receiverId === receiverId)) {
            set({
                loading: false,
                toastMessage: {
                    type: 'error',
                    title: 'Error sending friend request',
                    message: 'You already send the friend request.'
                }
            });
            return;
        }
        if (state.friends.some(e => e.friendId === receiverId)) {
            set({
                loading: false,
                toastMessage: {
                    type: 'error',
                    title: 'Error sending friend request',
                    message: 'You two are already a friend.'
                }
            });
            return;
        }

        const { data, error } = await supabase
            .from('friend_requests')
            .insert({ receiver_id: receiverId })
            .select();

        if (error?.message.includes('sending another friend request after rejection')) {
            set({
                loading: false,
                toastMessage: {
                    type: 'error',
                    title: 'Error sending friend request',
                    message: 'You need to wait for a while before sending another request.'
                }
            });
            return;
        }
        if (error) {
            console.error('Error inserting friend request: ', error.message);
            set({
                toastMessage: {
                    type: 'smallErr',
                    title: 'Failed to send friend request',
                },
            });
            return;
        }

        const sentRequests: FriendRequestType[] = mapRequestFromDB(data);
        set((state) => ({
            pendingSentRequests: [...state.pendingSentRequests, ...sentRequests],
            userPublicProfiles: {
                ...state.userPublicProfiles,
                [receiverId]: receiverPublicProfile
            },
            toastMessage: {
                type: 'small',
                title: 'Friend request sent successfully',
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
            set({
                toastMessage: {
                    type: 'smallErr',
                    title: 'Failed to accept friend request',
                },
            });
            return;
        }


        set(state => ({
            pendingReceivedRequests: state.pendingReceivedRequests.filter(e => e.id !== requestId),
            toastMessage: {
                type: 'small',
                title: 'Friend request accepted sucessfully',
            }
        }));
    },

    rejectFriendRequest: async (requestId) => {

        set({ loading: true });

        const { data, error } = await supabase
            .from('friend_requests')
            .update({ status: 'rejected' })
            .eq('id', requestId);

        if (error) {
            console.error('Error rejecting request:', error.message);
            set({
                toastMessage: {
                    type: 'smallErr',
                    title: 'Failed to reject friend request',
                },
            });
            return;
        }


        set((state) => {
            const rejectedRequest = state.pendingReceivedRequests.find(e => e.id === requestId);
            const rejectedUserId = rejectedRequest?.senderId;

            const { [rejectedUserId!]: _, ...updatedUserPublicProfiles } = state.userPublicProfiles;

            return {
                pendingSentRequests: state.pendingSentRequests.filter(e => e.id !== requestId),
                userPublicProfiles: updatedUserPublicProfiles,
                toastMessage: {
                    type: 'small',
                    title: 'Friend request rejected sucessfully',
                },
            };
        });
    },

    /**
     * * Do not use outside of this file *
     */
    _removeFriendRequest: async (requestId) => {

        set({ loading: true });

        const { error } = await supabase
            .from('friend_requests')
            .delete()
            .eq('id', requestId);

        if (error) {
            throw new Error('Error removing friend request: ' + error.message);
        }
    },

    /**
     * * Do not use outside of this file *
     */
    _updateFriendRequest: async (requestId, status) => {

        set({ loading: true });

        const { error } = await supabase
            .from('friend_requests')
            .update({ status })
            .eq('id', requestId);

        if (error) {
            throw new Error('Error updating friend request: ' + error.message);
        }

    },

    cancelFriendRequest: async (requestId) => {

        set({ loading: true });

        const { _updateFriendRequest: updateFriendRequest, pendingSentRequests, userPublicProfiles } = get();

        try {
            await updateFriendRequest(requestId, "cancelled");
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
                    userPublicProfiles: updatedUserPublicProfiles,
                    toastMessage: {
                        type: 'small',
                        title: 'Friend request cancelled successfully',
                    }
                });
            }
        } catch (e: any) {
            console.error("Error cancel friend request: ", e.message);
            set({
                toastMessage: {
                    type: 'smallErr',
                    title: 'Failed to cancel friend request',
                },
            });
        }
    },

    /**
     * * Do not use outside of this file *
     */
    _getRequestIdFromUserId: (anotherUserId) => {

        const { pendingSentRequests, pendingReceivedRequests } = get();

        // Find in sent requests
        const sentRequest = pendingSentRequests.find(e => e.receiverId === anotherUserId);
        if (sentRequest) return sentRequest.id;

        // Find in received requests
        const receivedRequest = pendingReceivedRequests.find(e => e.senderId === anotherUserId);
        if (receivedRequest) return receivedRequest.id;

        return '';
    },

    //TODO: Add toast IF NECESSARY
    removeFriend: async (friendId, session) => {

        set({ loading: true });

        const userId = session.user.id;

        const { error: friendsErr } = await supabase
            .from('friends')
            .delete()
            .or(`(user_id.eq.${userId},friend_id.eq.${friendId}),(user_id.eq.${friendId},friend_id.eq.${userId})`);

        //TODO: Check if its necessary to throw
        if (friendsErr) {
            set({
                toastMessage: {
                    type: 'smallErr',
                    title: 'Failed to remove Friend',
                },
            });
            throw new Error(`Error removing friend: ${friendsErr?.message}`);
        }
    },

    blockUser: async (blockedId, blockedPublicProfile, session) => {

        set({ loading: true });

        const userId = session.user.id;

        const {
            userPublicProfiles,
            blockedUsers,
            pendingSentRequests,
            pendingReceivedRequests,
            friends,
            _updateFriendRequest,
            removeFriend,
            cancelFriendRequest
        } = get();

        if (userId === blockedId) {
            set({
                loading: false,
                toastMessage: {
                    type: 'small',
                    title: "You can't block yourself 🤔",
                }
            });
            return;
        }
        const existingBlock = blockedUsers.find(e => e.blockedId === blockedId);
        if (existingBlock) {
            set({
                loading: false,
                toastMessage: {
                    type: 'small',
                    title: 'You already blocked the user',
                }
            });
            return;
        }
        // Only check when they are among friends, pending request or blocked users
        if (blockedId in userPublicProfiles) {

            let sentRequest, receivedRequest, friend;

            if (sentRequest = pendingSentRequests.find(e => e.receiverId === blockedId))
                _updateFriendRequest(sentRequest.id, 'disabled');
            else if (receivedRequest = pendingReceivedRequests.find(e => e.senderId === blockedId))
                _updateFriendRequest(receivedRequest.id, 'disabled');
            else if (friend = friends.find(e => e.friendId === blockedId))
                removeFriend(friend.id, session);
        }

        // Possibility of blocked user already send a friend request but haven't update yet.
        const { data: tmpData } = await supabase
            .from('friend_requests')
            .select('id')
            .eq('receiver_id', userId)
            .eq('sender_id', blockedId)
            .eq('status', 'pending');

        if (tmpData) {
            _updateFriendRequest(tmpData[0].id, 'disabled');
        }

        const { data, error } = await supabase
            .from('blocked_users')
            .insert({ blocked_id: blockedId })
            .select();

        set({ loading: false });

        if (error) {
            console.error('Error blocking user: ', error.message);
            set({
                toastMessage: {
                    type: 'smallErr',
                    title: 'Failed to block user',
                },
            });
            return;
        }

        if (!data || data.length === 0) {
            set({
                toastMessage: {
                    type: 'small',
                    title: 'Error blocking user',
                    message: "Cannot find the user specified"
                }
            });
            return;
        }

        const mappedblockedUsers = mapBlockedUserFromDB(data);
        set((state) => ({
            blockedUsers: [...state.blockedUsers, ...mappedblockedUsers],
            userPublicProfiles: {
                ...state.userPublicProfiles,
                [blockedId]: blockedPublicProfile
            },
            toastMessage: {
                type: 'success',
                title: 'User blocked',
                message: 'They can no longer interact with you',
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
                    const { id: requestId, receiver_id: receiverId, status } = payload.new;

                    if (!requestId || status === 'pending') return;

                    if (status === 'accepted') {
                        set((state) => {
                            const receiverName = state.userPublicProfiles[receiverId].name;
                            return ({
                                toastMessage: {
                                    type: 'success',
                                    title: `${receiverName} accepted your friend request`,
                                    message: 'You can now interact with each other',
                                }
                            });
                        });
                    }

                    if (status === 'accepted' || status === 'rejected' || status === 'disabled') {
                        set((state) => ({
                            pendingSentRequests: state.pendingSentRequests.filter(e => e.id !== requestId)
                        }));
                    }
                }
            )
            // Listen for updates in friend_requests for receiver
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'friend_requests',
                    filter: `receiver_id=eq.${userId}`
                },
                (payload) => {
                    const { id: requestId, status } = payload.new;

                    if (!requestId || status === 'pending') return;

                    if (status === 'cancelled' || status === 'disabled') {
                        set((state) => ({
                            pendingReceivedRequests: state.pendingReceivedRequests.filter(e => e.id !== requestId)
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

                    const profile = await get().fetchUserPublicProfile({ userId: senderId });

                    set((state) => ({
                        pendingReceivedRequests: [...state.pendingReceivedRequests, { id: requestId, senderId, status }],
                        userPublicProfiles: {
                            ...state.userPublicProfiles,
                            [senderId]: profile,
                        },
                        toastMessage: {
                            type: 'success',
                            title: `${profile.name} sent you a friend request`,
                            message: 'You can now accept or reject the request',
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
                        getBlockedByUsers: new Set<string>([...state.getBlockedByUsers, getBlockedById]),
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
                    // TODO: According to the documentaion the filter should work just fine for DELETE, but after multiple test and debuggging it seems like it doesn't work as expected
                    // filter: `user_id=eq.${userId}`
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
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    },
}));