// stores/authStore.ts
import { create } from 'zustand';
import { supabase } from '@/utils/supabase';
import { Session, Subscription, User } from '@supabase/supabase-js';
import { router } from 'expo-router';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthResult = {
    user?: User | null;
    session?: Session | null;
    error?: string;
};

interface AuthState {
    session: Session | null;
    isLoading: boolean;
    userIsReady: boolean;
    streamData: { apiKey: string; token: string; };

    subscribeToChanges: () => Promise<Subscription>;
    setSession: (session: Session | null) => void;
    refreshSession: () => void;
    signUp: (email: string, password: string) => Promise<AuthResult>;
    signIn: (email: string, password: string) => Promise<AuthResult>;
    signOut: () => Promise<{ error?: string; }>;
    resendEmailLink: (email: string) => Promise<{ data?: object; error?: string; }>;
    setUserIsReady: (isReady: boolean) => Promise<{ data?: object; error?: string; }>;
    updateUserData: (data: { [key: string]: string | number | boolean; }) => Promise<{ data?: object; error?: string; }>;
    authenticateStream: (userId?: string) => Promise<{ data?: object; error?: string; }>;
}

export const useAuthStore = create<AuthState>()(
    devtools(
        persist(
            ((set, get) => ({
                session: null,
                isLoading: true,
                userIsReady: false,
                streamData: { apiKey: '', token: 'string' },

                subscribeToChanges: async () => {
                    const {
                        data: { subscription },
                    } = supabase.auth.onAuthStateChange(async (event, session) => {
                        // console.warn(`Event: ${event}`, session);

                        set({ isLoading: true });

                        if (event === 'SIGNED_OUT' || !session) {
                            set({
                                session: null,
                                userIsReady: false,
                                streamData: { apiKey: '', token: 'string' },
                            });
                            router.replace('/');
                        } else if (event === 'SIGNED_IN') {
                            // Only authenticate Stream on first sign in
                            set({
                                session,
                                userIsReady: session.user.user_metadata?.is_ready ?? false,
                            });
                            const { error } = await get().authenticateStream(session.user.id);
                            if (error) console.error("Auth Change Error: ", error);
                        } else if (event === 'TOKEN_REFRESHED') {
                            // Just update session if needed
                            set({
                                session,
                                userIsReady: session.user.user_metadata?.is_ready ?? false,
                            });
                        }

                        set({ isLoading: false });
                    });

                    return subscription;
                },

                setSession: (session: Session | null) => set({ session }),

                refreshSession: async () => {
                    const { data: { session } } = await supabase.auth.getSession();

                    set({ session });
                },

                signUp: async (email, password) => {
                    set({ isLoading: true });
                    const { data: { user, session }, error } = await supabase.auth.signUp({
                        email,
                        password,
                        options: { data: { is_ready: false } },
                    });
                    set({ isLoading: false });
                    return { user, session, error: error?.message };
                },

                signIn: async (email, password) => {

                    set({ isLoading: true });
                    const { data: { user, session }, error } = await supabase.auth.signInWithPassword({ email, password });

                    if (session?.user.user_metadata.is_ready) {
                        await get().authenticateStream(session.user.id);
                    }

                    set({ session, userIsReady: !!session?.user.user_metadata.is_ready, isLoading: false });
                    return { user, session, error: error?.message };
                },

                signOut: async () => {
                    set({ isLoading: true });
                    const { error } = await supabase.auth.signOut();
                    set({ isLoading: false });
                    return { error: error?.message };
                },

                resendEmailLink: async (email) => {
                    set({ isLoading: true });
                    const { data, error } = await supabase.auth.resend({ type: 'signup', email });
                    set({ isLoading: false });
                    return { data, error: error?.message };
                },

                setUserIsReady: async (isReady) => {
                    const { updateUserData } = get();
                    set({ isLoading: true });
                    const { data, error } = await updateUserData({ is_ready: isReady });
                    set({ userIsReady: isReady, isLoading: false });
                    return { data, error };
                },

                updateUserData: async (data) => {
                    set({ isLoading: true });
                    const { data: dataUpdate, error } = await supabase.auth.updateUser({ data });
                    set({ isLoading: false });
                    return { data: dataUpdate, error: error?.message };
                },

                authenticateStream: async (userId = get().session?.user.id) => {
                    set({ isLoading: true });
                    const { data, error } = await supabase.functions.invoke('create-stream-token', {
                        body: { userId },
                    });

                    if (error) {
                        console.error(error);
                        await get().signOut();
                        set({ isLoading: false });
                        return { data, error: error.message };
                    }

                    const { apiKey, token } = JSON.parse(data);
                    set({ streamData: { apiKey, token }, isLoading: false });
                    return { data };
                },
            })),
            {
                name: 'auth-store',
                storage: createJSONStorage(() => AsyncStorage),
            }
        )
    )
);
