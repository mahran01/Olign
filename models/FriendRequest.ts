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
    sender_id: string;
    senderPublicProfile: UserPublicProfile;
};

export type SentFriendRequest = {
    id: string;
    createdAt: Date;
    status: FriendRequestStatus;
    receiver_id: string;
    receiverPublicProfile: UserPublicProfile;
};