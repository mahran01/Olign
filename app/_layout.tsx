import '@/tamagui-web.css';
// import '@/config/firebaseConfig';
import React from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Slot, Stack } from 'expo-router';
import { AuthProvider } from '@/contexts';
import { TamaguiProvider, View, Text, useTheme } from 'tamagui';
import tamaguiConfig from '@/tamagui.config';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';

import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Set the animation options. This is optional.
SplashScreen.setOptions({
    duration: 1000,
    fade: true,
});

interface IRootLayoutProps {
}

const RootLayout: React.FC<IRootLayoutProps> = () => {

    const colorScheme = useColorScheme();

    const [loaded] = useFonts({
        SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    });

    React.useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

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
