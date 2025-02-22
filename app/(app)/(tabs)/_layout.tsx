import React, { ComponentProps, useState } from 'react';
import { TabView, SceneMap, TabBar, TabBarItem } from 'react-native-tab-view';
import { View, useTheme, Text, Button, XStack } from 'tamagui';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Header, TabBarIcon } from '@/components';
import { CloudMoon, CloudSun, LogOut } from '@tamagui/lucide-icons';
import { useColorScheme, Appearance } from 'react-native';

import Dashboard from './index';
import ChannelList from './channel-list';
import TaskList from './task-list';
import Profile from './profile';
import { useAuthContext } from '@/contexts';


const TabLayout = () => {
    const theme = useTheme();
    const colorScheme = useColorScheme();
    const { signOut } = useAuthContext();

    const bgColor = theme.background.val;
    const activeColor = theme.accentColor.val;
    const inactiveColor = theme.color075.val;

    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { index: 0, key: 'dashboard', title: 'Dashboard', icon: "grid" },
        { index: 1, key: 'channel', title: 'Channels', icon: "chatbubbles" },
        { index: 2, key: 'task', title: 'Calendar', icon: "calendar" },
        { index: 3, key: 'profile', title: 'Profile', icon: "person-circle" },
    ]);

    const renderScene = SceneMap({
        dashboard: Dashboard,
        channel: ChannelList,
        task: TaskList,
        profile: Profile,
    });

    const renderTabBarItem = (props: any) => {

        const { route } = props;
        const isFocused = index === route.index;
        const iconName = route.icon + (isFocused ? '' : '-outline') as ComponentProps<typeof Ionicons>["name"];

        return (
            <TabBarItem
                {...props}
                key={props.key}
                icon={({ color }) => <TabBarIcon name={iconName} color={color} />}
                onPress={() => setIndex(route.index)}
                onLongPress={() => null}
                labelStyle={{ paddingTop: 2 }}
                android_ripple={{ color: null }}
            />
        );
    };

    const renderTabBar = (props: any) => {
        const tabBarStyles = {
            backgroundColor: bgColor,
            paddingTop: 10,
            paddingBottom: 5,
        };
        return (
            <TabBar
                {...props}
                style={tabBarStyles}
                renderIndicator={() => null}
                indicatorStyle={{ backgroundColor: 'blue' }} // Custom indicator
                renderTabBarItem={renderTabBarItem}
                android_ripple={{ color: null }}
                activeColor={activeColor}
                inactiveColor={inactiveColor}
            />
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
                <Button
                    bg={bgColor}
                    icon={<LogOut size={'$1'} />}
                    onPress={signOut}
                    circular={true}
                />
            </XStack>
        );

        switch (routes[index].key) {
            case 'dashboard':
                break;
            case 'channel':
                break;
            case 'task':
                break;
            case 'profile':
                break;
        }
        return (
            <Header
                title={routes[index].title}
                color={'$background'}
                right={right}
            />
        );
    };

    return (
        <View f={1}>
            {/* Header outside of TabView */}
            {buildHeader()}

            {/* TabView */}
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                renderTabBar={renderTabBar}
                initialLayout={{ width: 400 }}
                swipeEnabled={true}
                tabBarPosition='bottom'
                style={{ flex: 1 }}
            />
        </View>
    );
};

export default TabLayout;