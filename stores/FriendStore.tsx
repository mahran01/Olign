import { create } from 'zustand';
import { supabase } from '@/utils/supabase';
import { UserPublicProfileType, FriendRequestType as DirtyFriendRequestType, FriendType } from '@/models';

type FriendRequestType = Omit<DirtyFriendRequestType, 'rejectedAt'>;

export type FriendState = {
    friends: FriendType[];
    sentRequests: FriendRequestType[];
    receivedRequests: FriendRequestType[];
    userPublicProfiles: UserPublicProfileType[];
    loading: boolean;
};

export type FriendAction = {
    fetchFriends: (userId: string) => Promise<void>;
    sendFriendRequest: (receiverId: string) => Promise<void>;
    acceptFriendRequest: (requestId: string) => Promise<void>;
    rejectFriendRequest: (requestId: string) => Promise<void>;
    subscribeToChanges: (userId: string) => void;
};

export type FriendStore = FriendState & FriendAction;

export const defaultInitState: FriendState = {
    friends: [],
    sentRequests: [],
    receivedRequests: [],
    userPublicProfiles: [],
    loading: false,
};
