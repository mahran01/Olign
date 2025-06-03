import { z } from 'zod';

export const UserProfilesInsertSchema = z.object({
    user_id: z.string().uuid(),
    username: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    avatar_uri: z.string().nullable().optional(),
});

export const UserProfilesUpdateSchema = UserProfilesInsertSchema.partial();

export const UserProfilesFetchSchema = z.object({
    id: z.string().uuid().optional().default(() => crypto.randomUUID()),
    ...UserProfilesInsertSchema.shape,
});


export type UserProfileInsert = z.infer<typeof UserProfilesInsertSchema>;
export type UserProfileUpdate = z.infer<typeof UserProfilesUpdateSchema>;
export type UserProfile = z.infer<typeof UserProfilesFetchSchema>;