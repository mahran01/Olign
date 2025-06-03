import { useAuthStore } from '@/stores';
import { Subscription } from '@supabase/supabase-js';
import React, { useEffect } from 'react';

interface IAuthWrapperProps {
}

const AuthWrapper: React.FC<React.PropsWithChildren<IAuthWrapperProps>> = ({ children }) => {

    const subscribeToChanges = useAuthStore(s => s.subscribeToChanges);

    useEffect(() => {
        let subscription: Subscription | null = null;

        (async () => {
            subscription = await subscribeToChanges();
        })();

        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, []);

    return <>{children}</>;
};

export default AuthWrapper;
