import { AuthProvider } from '@/contexts';
import '@/tamagui-web.css';
import tamaguiConfig from '@/tamagui.config';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider } from 'tamagui';

import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';

interface IRootLayoutProps {
}

const RootLayout: React.FC<IRootLayoutProps> = () => {

    const colorScheme = useColorScheme();

    const [loaded] = useFonts({
        SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    });

    return (
        <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme!}>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <SafeAreaProvider>
                    <GestureHandlerRootView>
                        <AuthProvider>
                            <StatusBar />
                            <Stack screenOptions={{ headerShown: false }}>
                                <Stack.Screen name="(app)" />
                                <Stack.Screen name="+not-found" />
                            </Stack>
                        </AuthProvider>
                    </GestureHandlerRootView>
                </SafeAreaProvider>
            </ThemeProvider>
        </TamaguiProvider>
    );
};


export default RootLayout;
