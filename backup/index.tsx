import React, { useContext, useMemo } from 'react';
import { StyleSheet, Text } from "react-native";
import { ChannelList } from "stream-chat-expo";
import { ChannelSort, ChannelFilters } from 'stream-chat';
import { Stack, useRouter } from 'expo-router';
import { AppContext } from '@/contexts';
import { chatUserId } from '@/config/chatConfig';
import { CustomListItem } from '@/components';
import ThreeColumns from '@/components/shared/ThreeColumns';
import { View } from 'tamagui';

const filters: ChannelFilters = {
    members: { $in: [chatUserId] },
    type: "messaging",
};

const sort: ChannelSort = { last_updated: -1 };

const options = {
    state: true,
    watch: true,
};


interface IChannelListScreenProps {
}

const ChannelListScreen: React.FC<IChannelListScreenProps> = () => {
    const memoizedFilters: ChannelFilters = useMemo(() => filters, []);
    const router = useRouter();
    const { setChannel } = useContext(AppContext);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: "Channel List Screen" }} />
            <ChannelList Preview={CustomListItem} filters={memoizedFilters} options={options} sort={sort} onSelect={(channel) => {
                setChannel(channel);
                router.push(`/channel/${channel.cid}`);
            }} />
            <ThreeColumns
                // left={() => <View bg={'red'}><Text>Left</Text></View>}
                middle={() => <View bg={'blue'} width={"100%"}><Text>Midlle</Text></View>}
                right={() => <View bg={'green'} ><Text>Left</Text></View>}
            />
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default ChannelListScreen;
