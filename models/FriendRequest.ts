import { UserPublicProfile } from "./UserProfile";

export type FriendRequestStatus = "pending" | "accepted" | "rejected";

export type FriendRequest = {
    id: string;
    senderId: string;
    receiverId: string;
    createdAt: Date;
    status: FriendRequestStatus;
    rejectedAt: Date | null;
};

export type ReceivedFriendRequest = {
    id: string;
    createdAt: Date;
    status: FriendRequestStatus;
    senderId: string;
    senderPublicProfile: UserPublicProfile;
};

export type SentFriendRequest = {
    id: string;
    createdAt: Date;
    status: FriendRequestStatus;
    receiverId: string;
    receiverPublicProfile: UserPublicProfile;
};