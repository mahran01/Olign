import React, { useState } from 'react';
import { TabView, SceneMap } from 'react-native-tab-view';
import { View, useTheme, Button, XStack, XGroup } from 'tamagui';
import { Header } from '@/components';
import { CloudMoon, CloudSun, LogIn, UserPlus2 } from '@tamagui/lucide-icons';
import { useColorScheme, Appearance } from 'react-native';

import SignIn from './sign-in';
import SignUp from './sign-up';

interface IAppProps {
}

const AuthLayout: React.FC<IAppProps> = () => {
    const theme = useTheme();
    const colorScheme = useColorScheme();

    const bgColor = theme.background.val;

    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { index: 0, key: 'signIn', title: 'Sign In', icon: <LogIn /> },
        { index: 1, key: 'signUp', title: 'Sign Up', icon: <UserPlus2 /> },
    ]);

    const renderScene = SceneMap({
        signIn: SignIn,
        signUp: SignUp,
    });

    const buildButton = (routeIndex: number) => {
        const isActive = index === routeIndex;
        const theme = isActive ? 'accent' : undefined;
        const variant = isActive ? undefined : 'outlined';
        return (
            <Button w="50%" icon={routes[routeIndex].icon} disabled={isActive} theme={theme} variant={variant} onPress={() => setIndex(routeIndex)}>
                {routes[routeIndex].title}
            </Button>
        );
    };

    const renderTabBar = () => {
        return (
            <XGroup w='100%' pt='$6' px='$6'>
                <XGroup.Item>{buildButton(0)}</XGroup.Item>
                <XGroup.Item>{buildButton(1)}</XGroup.Item>
            </XGroup>
        );
    };


    const buildHeader = () => {
        const toggleMode = () => {
            Appearance.setColorScheme(colorScheme === "dark" ? "light" : "dark");
        };

        const right = () => (
            <XStack>
                <Button
                    bg={bgColor}
                    icon={colorScheme === 'dark' ? <CloudMoon size={'$1'} /> : <CloudSun size={24} />}
                    onPress={toggleMode}
                    circular={true}
                />
            </XStack>
        );

        return (
            <Header
                title={routes[index].title}
                color={bgColor}
                right={right}
            />
        );
    };

    return (
        <View f={1} bg='$background'>
            {/* Header outside of TabView */}
            {buildHeader()}

            {/* TabView */}
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: 400 }}
                renderTabBar={renderTabBar}
                swipeEnabled={true}
                tabBarPosition='top'
                style={{ flex: 1 }}
            />
        </View>
    );
};

export default AuthLayout;