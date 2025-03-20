import '@/tamagui-web.css';
import tamaguiConfig from '@/tamagui.config';
import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider } from 'tamagui';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';

interface IRootProps {
}

const Root: React.FC<IRootProps> = () => {

    const colorScheme = useColorScheme();

    return (
        <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme!}>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <SafeAreaProvider>
                    <GestureHandlerRootView>
                        <StatusBar />
                        <Stack screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="(app)" />
                            <Stack.Screen name="+not-found" />
                        </Stack>
                    </GestureHandlerRootView>
                </SafeAreaProvider>
            </ThemeProvider>
        </TamaguiProvider >
    );
};

export default Root;
