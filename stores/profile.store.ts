import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { retryWithJitter, supabase, validate, validateArray } from '@/utils';
import { useAuthStore } from './auth.store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfilesFetchSchema, UserProfileType } from '@/schemas';

type ProfileState = {
    profiles: Record<string, UserProfileType>;
    loading: boolean;
};

type ProfileActions = {
    fetchUserProfile: (userId?: string) => Promise<UserProfileType>;
    fetchMultipleUserProfiles: (userIds: string[]) => Promise<Record<string, UserProfileType> | undefined>;
    clearProfiles: () => void;
    subscribeToChanges: () => (() => Promise<"ok" | "timed out" | "error">);
};

export const useProfileStore = create<ProfileState & ProfileActions>()(
    devtools(persist(
        (set, get) => ({
            profiles: {},
            loading: false,

            fetchUserProfile: async (userId?) => {

                if (!userId) {
                    const session = useAuthStore.getState().session;
                    if (!session) throw new Error('Unexpected Session Error, Please log out and re-login');
                    userId = session.user.id;
                }

                const existing = get().profiles[userId];
                if (existing) return existing;

                set({ loading: true });

                const { data, error } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('user_id', userId)
                    .single();

                set({ loading: false });

                if (error || !data) {
                    throw new Error(error?.message ?? 'Profile not found');
                }

                const validated = validate(UserProfilesFetchSchema, data);

                set((state) => ({
                    profiles: { ...state.profiles, [userId]: validated },
                }));

                return validated;
            },

            fetchMultipleUserProfiles: async (userIds: string[]) => {
                if (userIds.length === 0) return;

                let profiles = get().profiles;

                const missingIds = userIds.filter((id) => profiles[id]);

                if (missingIds.length > 0) {
                    set({ loading: true });

                    const { data, error } = await supabase
                        .from('user_profiles')
                        .select('*')
                        .in('user_id', missingIds);

                    set({ loading: false });

                    if (error || !data) {
                        console.error('Error fetching multiple user profiles:', error?.message);
                        return;
                    }

                    const validated = validateArray(UserProfilesFetchSchema, data);

                    set((state) => ({
                        profiles: validated.reduce((acc, user) => {
                            acc[user.user_id] = user;
                            return acc;
                        }, { ...state.profiles }),
                    }));

                    profiles = get().profiles;
                }

                return userIds.reduce((acc, id) => {
                    acc[id] = profiles[id];
                    return acc;
                }, {} as Record<string, UserProfileType>);
            },

            clearProfiles: () => set({ profiles: {} }),

            subscribeToChanges: () => {

                const userId = useAuthStore.getState().session?.user.id;
                if (!userId) throw new Error('Unexpected Sesssion Error, Please log out and re-login');

                const channel = supabase
                    .channel(`profile-changes-${userId}`)
                    .on(
                        'postgres_changes',
                        {
                            event: 'UPDATE',
                            schema: 'public',
                            table: 'user_profiles',
                        },
                        (payload) => {
                            const { user_id } = payload.new;

                            if (user_id in get().profiles) {
                                const validated = validate(UserProfilesFetchSchema, payload.new);
                                set((state) => ({ profiles: { ...state.profiles, [user_id]: validated } }));
                            }
                        }
                    )
                    .subscribe();

                return () => {
                    return channel.unsubscribe();
                };
            }
        }),
        {
            name: 'profile-store',
            storage: createJSONStorage(() => AsyncStorage),
        }
    ))
);
