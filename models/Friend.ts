// export type Friend = {
//     id: string;
//     userId: string;
//     friendId: string;
//     createdAt: Date;
// };

export type Friend = {
    id: string;
    friendId: string;
};

export const mapFriendFromDB = (data: any[] | null): Friend[] => data?.map(e => ({
    id: e.id,
    friendId: e.friend_id,
})) || [];