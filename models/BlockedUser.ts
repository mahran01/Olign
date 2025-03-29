export type BlockedUser = {
    id: string;
    blockedId: string;
};

export const mapBlockedUserFromDB = (data: any[] | null): BlockedUser[] => data?.map(e => ({
    id: e.id,
    blockedId: e.blocked_id,
})) || [];