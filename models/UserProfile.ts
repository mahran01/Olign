export type UserProfile = UserPublicProfile & {
    id: string;
    userId: string;
};

export type UserPublicProfile = {
    username: string | null;
    name: string | null;
    avatar_uri: string | null;
};