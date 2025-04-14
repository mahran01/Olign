import { AuthProvider } from '@/contexts';
import '@/tamagui-web.css';
import tamaguiConfig from '@/tamagui.config';
import { ToastProvider, ToastViewport } from '@tamagui/toast';
import React from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider, type TamaguiProviderProps } from 'tamagui';
import { CurrentToast } from './CurrentToast';

export function RootProvider({ children, ...rest }: Omit<TamaguiProviderProps, 'config'>) {
    const colorScheme = useColorScheme();

    return (
        <TamaguiProvider
            config={tamaguiConfig}
            defaultTheme={colorScheme === 'dark' ? 'dark' : 'light'}
            {...rest}
        >
            <SafeAreaProvider>
                <GestureHandlerRootView>
                    <AuthProvider>
                        <ToastProvider
                            swipeDirection="horizontal"
                            duration={6000}
                            native={
                                [
                                    // uncomment the next line to do native toasts on mobile. NOTE: it'll require you making a dev build and won't work with Expo Go
                                    'mobile'
                                ]
                            }
                        >
                            {children}
                            <CurrentToast />
                            <ToastViewport top="$8" left={0} right={0} />
                        </ToastProvider>
                    </AuthProvider>
                </GestureHandlerRootView>
            </SafeAreaProvider>
        </TamaguiProvider>
    );
}
