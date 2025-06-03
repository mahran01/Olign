import { Header, TabBarIcon } from '@/components';
// import { useAuthContext } from '@/contexts';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CloudMoon, CloudSun, LogOut } from '@tamagui/lucide-icons';
import React, { ComponentProps, useState } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { SceneMap, TabBar, TabBarItem, TabView } from 'react-native-tab-view';
import { Button, View, XStack, useTheme } from 'tamagui';
import ChannelList from '.';
import Friends from './friends';
import Profile from './profile';
import TaskList from './tasks';
import { useAuthStore } from '@/stores';

const TabLayout = () => {
    const theme = useTheme();
    const colorScheme = useColorScheme();
    // const { signOut } = useAuthContext();
    const signOut = useAuthStore(s => s.signOut);

    const bgColor = theme.color1.val;
    const activeColor = theme.accent5.val;
    const inactiveColor = theme.color08.val;

    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { index: 0, key: 'channel', title: 'Channels', icon: "chatbubbles" },
        { index: 1, key: 'task', title: 'Tasks', icon: "calendar" },
        { index: 2, key: 'friends', title: 'Friends', icon: "people" },
        { index: 3, key: 'profile', title: 'Profile', icon: "person" },
    ]);

    const renderScene = SceneMap({
        channel: ChannelList,
        task: TaskList,
        friends: Friends,
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
                color={bgColor}
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