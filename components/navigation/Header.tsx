import * as React from 'react';
import { View, Button, Text, SizableText, useTheme, YStack, XStack } from 'tamagui';
import ThreeColumns from '@/components/shared/ThreeColumns';
import { ArrowLeft, CloudMoon, CloudSun } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Appearance, useColorScheme } from 'react-native';

interface IHeaderProps {
    backButton?: boolean;
    backButtonFunction?: () => void;
    swicthDarkThem?: boolean;
    title?: string;
    left?: () => React.ReactNode;
    middle?: () => React.ReactNode;
    right?: () => React.ReactNode;
    color?: string;
}

const Header: React.FC<IHeaderProps> = (props) => {
    const { backButton: enableBackButton, backButtonFunction = () => router.back(), swicthDarkThem, title, left, middle, right, color = "$background" } = props;
    const insets = useSafeAreaInsets();


    const colorScheme = useColorScheme();

    const toggleMode = () => {
        Appearance.setColorScheme(colorScheme === "dark" ? "light" : "dark");
    };

    const swicthDarkThemButton = () => (
        <Button
            bg={color}
            icon={colorScheme === 'dark' ? <CloudMoon size={'$1'} /> : <CloudSun size={24} />}
            onPress={toggleMode}
            circular={true}
        />
    );

    return (
        <XStack bg={color} pt={insets.top} pb={10} ai='center'>
            <View mx={8}>
                {enableBackButton && (<Button bg={color} icon={<ArrowLeft size={'$1'} />} onPress={backButtonFunction} circular={true} />)}
                {left && left()}
            </View>
            <View f={1} mx={8} jc='center'>
                {title && (<Text fos={20} >{title}</Text>)}
                {middle && middle()}
            </View>
            <View mx={8}>
                <XStack>
                    {swicthDarkThem && swicthDarkThemButton()}
                    {right && right()}
                </XStack>
            </View>
        </XStack >
    );
};

export default Header;
