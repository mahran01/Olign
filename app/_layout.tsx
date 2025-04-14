import { Provider } from '@/components';
import '@/tamagui-web.css';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useTheme } from 'tamagui';
import '../tamagui-web.css';

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
    // Ensure that reloading on `/modal` keeps a back button present.
    initialRouteName: '(app)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [interLoaded, interError] = useFonts({
        Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
        InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    });

    useEffect(() => {
        if (interLoaded || interError) {
            // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
            SplashScreen.hideAsync();
        }
    }, [interLoaded, interError]);

    if (!interLoaded && !interError) {
        return null;
    }

    return (
        <Providers>
            <RootLayoutNav />
        </Providers>
    );
}

const Providers = ({ children }: { children: React.ReactNode; }) => {
    return <Provider>{children}</Provider>;
};

function RootLayoutNav() {
    const colorScheme = useColorScheme();
    const theme = useTheme();
    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <StatusBar />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(app)" />
                <Stack.Screen name="+not-found" />
                {/* <Stack.Screen
                    name="modal"
                    options={{
                        title: 'Tamagui + Expo',
                        presentation: 'modal',
                        animation: 'slide_from_right',
                        gestureEnabled: true,
                        gestureDirection: 'horizontal',
                        contentStyle: {
                            backgroundColor: theme.background.val,
                        },
                    }}
                /> */}
            </Stack>
        </ThemeProvider>
    );
}
