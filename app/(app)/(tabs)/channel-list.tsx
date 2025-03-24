import { AppContext, useAuthContext } from '@/contexts';
import { MessageCirclePlus } from '@tamagui/lucide-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useContext, useMemo, useState } from 'react';
import { ChannelFilters, ChannelSort } from 'stream-chat';
import { ChannelList, useChatContext } from "stream-chat-expo";
import { Button, View } from 'tamagui';


const sort: ChannelSort = { last_updated: -1 };

const options = {
    state: true,
    watch: true,
};

interface IChannelListScreenProps {
}

const ChannelListScreen: React.FC<IChannelListScreenProps> = () => {
    const { session } = useAuthContext();
    const chatUserId = session?.user.id!;
    const filters: ChannelFilters = {
        members: { $in: [chatUserId] },
        type: "messaging",
    };

    const memoizedFilters: ChannelFilters = useMemo(() => filters, []);
    const router = useRouter();
    const { setChannel } = useContext(AppContext);
    const { client, isOnline } = useChatContext();

    const [channelName, setChannelName] = useState('HardCodedChannelTest');
    const [isCreatingChannel, setIsCreatingChannel] = useState(false);

    const createChannel = async () => {
        setIsCreatingChannel(true);
        try {
            // const newChannel = await client.channel('messaging', {
            //     name: channelName,
            //     members: ["TestUser01", "TestUser02"]
            // });
            // await newChannel.watch();
            // setChannel(newChannel);

            // router.push(`/channel/${newChannel.cid}`);
        } catch (error) {
            console.error('Error creating channel:', error);
        } finally {
            setIsCreatingChannel(false);
        }
    };

    return (
        <View flex={1} bg='blue' h={1000} w='100%'>
            <Stack.Screen options={{ title: "Channel List Screen" }} />
            <ChannelList filters={memoizedFilters} options={options} sort={sort} onSelect={(channel) => {
                setChannel(channel);
                router.push(`/channel-list/channel/${channel.cid}`);
            }} />
            <Button onPress={() => router.push('/channel-list/add-chats')} pos="absolute" b='$5' r='$5' size='$7' circular theme='accent'>
                <Button.Icon>
                    <MessageCirclePlus size='$2' />
                </Button.Icon>
            </Button>
        </View>
    );
};

export default ChannelListScreen;
