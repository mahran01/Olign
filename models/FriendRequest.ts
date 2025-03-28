import { UserPublicProfile } from "./UserProfile";

export type FriendRequestStatus = "pending" | "accepted" | "rejected";

// export type FriendRequest = {
//     id: string;
//     senderId: string;
//     receiverId: string;
//     createdAt: Date;
//     status: FriendRequestStatus;
// };

export type FriendRequest = {
    id: string;
    senderId: string;
    receiverId: string;
    status: FriendRequestStatus;
};

export const mapRequestFromDB = (data: any[] | null): FriendRequest[] => data?.map(e => ({
    id: e.id,
    status: e.status,
    senderId: e.sender_id,
    receiverId: e.receiver_id,
})) || [];

export type ReceivedFriendRequest = {
    id: string;
    status: FriendRequestStatus;
    senderId: string;
};

export type SentFriendRequest = {
    id: string;
    status: FriendRequestStatus;
    receiverId: string;
};