import { LogIn, UserPlus2 } from '@tamagui/lucide-icons';
import React, { useState } from 'react';
import { useColorScheme } from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { Button, useTheme, View, XGroup } from 'tamagui';
import ReceivedFriendRequests from './received-friend-requests';
import SentFriendRequests from './sent-friend-requests';
import { Stack } from 'expo-router';

interface IFriendRequestsLayoutProps {
}

const FriendRequestsLayout: React.FC<IFriendRequestsLayoutProps> = (props) => {
    const theme = useTheme();
    const colorScheme = useColorScheme();

    const bgColor = theme.background.val;
    const accentColor = theme.accentBackground.val;
    const textColor = theme.color.val;

    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { index: 0, key: 'sent', title: 'Sent', icon: <LogIn /> },
        { index: 1, key: 'received', title: 'Received', icon: <UserPlus2 /> },
    ]);

    const renderScene = SceneMap({
        sent: SentFriendRequests,
        received: ReceivedFriendRequests,
    });

    const renderTabBar = (props: any) => {
        return (
            <TabBar
                {...props}
                indicatorStyle={{ backgroundColor: accentColor }}
                style={{ backgroundColor: bgColor }}
                labelStyle={{ color: textColor, fontWeight: 'bold' }}
            />
        );
    };

    return (
        <View f={1} bg='$background'>
            {/* TabView */}
            <Stack.Screen options={{ title: "Friend Requests" }} />
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

export default FriendRequestsLayout;
