import React, { useState, createContext, useContext, useMemo, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuthContext } from './AuthContext';

type UserProfile = {
    id: string;
    user_id: string;
    usaername: string;
    name: string;
    avatar_uri: string;
};

interface IUserContextProps {
    userProfile: UserProfile | null;
    loading: boolean;
    getUserIdByUsername: (username: string) => Promise<string | null>;
}

export const UserContext = createContext<IUserContextProps>({
    userProfile: null,
    loading: true,
    getUserIdByUsername: async () => null,
});

export const UserProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const { session } = useAuthContext();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // Stores the user's profile
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (session) {
                await _fetchUser();
            }
            else {
                console.error('Not in session');
            }
        };
        fetchUserData();
    }, []);

    const _fetchUser = async () => {
        setLoading(true);
        const userId = session?.user.id;
        const { data: profile, error: profileError } = await supabase
            .from("user_profiles")
            .select('*')
            .eq("user_id", userId)
            .single();
        setLoading(false);
        if (profileError) {
            console.error('Error fetching user profile:', profileError.message);
            return;
        }
        setUserProfile(profile);
    };

    const getUserIdByUsername = async (username: string) => {
        setLoading(true);
        const { data: user, error: userError } = await supabase
            .from("user_profiles")
            .select("user_id")
            .eq("username", username)
            .single();
        if (userError) {
            console.error('Error fetching user:', userError.message);
            return null;
        }
        setLoading(false);
        return user.user_id;
    };

    const value = useMemo(
        () => ({
            userProfile,
            loading,
            getUserIdByUsername
        }),
        [
            userProfile,
            loading,
            getUserIdByUsername
        ]
    );

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUserContext must be used within an UserProvider');
    }
    return context;
};