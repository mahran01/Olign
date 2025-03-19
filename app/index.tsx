import '@/tamagui-web.css';
import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import { TamaguiProvider, View } from 'tamagui';

import tamaguiConfig from '@/tamagui.config';

interface IRootProps {
}

const Root: React.FC<IRootProps> = () => {
    const colorScheme = useColorScheme();
    return (
        <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme!}>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <View height={200} bg="$background" />
            </ThemeProvider>
        </TamaguiProvider>
    );
};

export default Root;
