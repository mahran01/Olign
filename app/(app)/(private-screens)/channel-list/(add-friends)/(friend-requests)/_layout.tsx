import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { useTheme } from 'tamagui';
import ReceivedFriendRequests from './received-friend-requests';
import SentFriendRequests from './sent-friend-requests';
import { useWindowDimensions } from 'react-native';

interface IFriendRequestsLayoutProps {
}

const FriendRequestsLayout: React.FC<IFriendRequestsLayoutProps> = (props) => {
    const theme = useTheme();
    const layout = useWindowDimensions();

    const bgColor = theme.background.val;
    const accentColor = theme.accentBackground.val;
    const textColor = theme.color.val;
    const textInactiveColor = theme.color10.val;

    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'sent', title: 'Sent' },
        { key: 'received', title: 'Received' },
    ]);

    const renderScene = SceneMap({
        sent: SentFriendRequests,
        received: ReceivedFriendRequests,
    });

    const renderTabBar = (props: any) => (
        <TabBar
            {...props}
            style={{ backgroundColor: bgColor }}
            indicatorStyle={{ backgroundColor: accentColor }}
            activeColor={textColor}
            inactiveColor={textInactiveColor}
        />
    );

    return (
        <>
            {/* TabView */}
            <Stack.Screen options={{ title: "Friend Requests" }} />
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                renderTabBar={renderTabBar}
                initialLayout={{ width: layout.width }}
            />
        </>
    );
};

export default FriendRequestsLayout;
