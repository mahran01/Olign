import { ChatWrapper } from '@/components';
import { AppProvider, FriendProvider, useAuthContext, UserProvider } from '@/contexts';
import { useFriendStore } from '@/stores';
import { Redirect, Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';

interface IAppProps {
}

const App: React.FC<IAppProps> = () => {

    const { session, isLoading, userIsReady } = useAuthContext();
    const { fetchAll, subscribeToChanges } = useFriendStore();

    useEffect(() => {
        if (session) {
            fetchAll(session);
            subscribeToChanges(session);
        }
    }, []);

    // You can keep the splash screen open, or render a loading screen like we do here.
    if (isLoading) {
        return <ActivityIndicator size={'small'} style={{ margin: 28 }} />;
    }

    // Only require authentication within the (app) group's layout as users
    // need to be able to access the (auth) group and sign in again.
    if (!session) {
        // On web, static rendering will stop here as the user is not authenticated
        // in the headless Node process that the pages are rendered in.
        return <Redirect href="/sign-in/" />;
    }

    if (!userIsReady) {
        const email = session.user.user_metadata.email;
        const beforeAtSymbol = email.split('@')[0];

        return <Redirect href={`/setup-username/create?username=${beforeAtSymbol.replaceAll('.', '_')}&name=${beforeAtSymbol.replaceAll('.', ' ')}`} />;
    }

    return (
        <UserProvider>
            <ChatWrapper>
                <AppProvider>
                    <Stack>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    </Stack>
                </AppProvider>
            </ChatWrapper>
        </UserProvider>
    );
};

export default App;
