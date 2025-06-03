import { ChatWrapper, StoreWrapper } from '@/components';
import { AppProvider, UserProvider } from '@/contexts';
import { useFriendStore, useTaskStore, useAuthStore } from '@/stores';
import { useToastController } from '@tamagui/toast';
import { Redirect, Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';

const App: React.FC = () => {
    const session = useAuthStore(s => s.session);
    const isLoading = useAuthStore(s => s.isLoading);
    const userIsReady = useAuthStore(s => s.userIsReady);

    if (isLoading) {
        return <ActivityIndicator size={'small'} style={{ margin: 28 }} />;
    }

    if (!session) {
        return <Redirect href="/sign-in/" />;
    }

    if (!userIsReady) {
        const email = session.user.user_metadata.email;
        const beforeAtSymbol = email.split('@')[0];

        return (
            <Redirect
                href={`/setup-username/create?username=${beforeAtSymbol.replaceAll(
                    '.', '_'
                )}&name=${beforeAtSymbol.replaceAll('.', ' ')}`}
            />
        );
    }

    return (
        <StoreWrapper>
            <UserProvider>
                <ChatWrapper>
                    <AppProvider>
                        <Stack>
                            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        </Stack>
                    </AppProvider>
                </ChatWrapper>
            </UserProvider>
        </StoreWrapper>
    );
};

export default App;