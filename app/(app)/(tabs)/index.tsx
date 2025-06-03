// import { AppContext, useAuthContext } from '@/contexts';
import { AppContext } from '@/contexts';
import { useAuthStore } from '@/stores';
import { MessageCirclePlus } from '@tamagui/lucide-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useContext, useMemo, useState } from 'react';
import { ChannelFilters, ChannelSort } from 'stream-chat';
import { ChannelList, useChatContext } from "stream-chat-expo";
import { Button, View } from 'tamagui';
import { LinearGradient } from 'tamagui/linear-gradient';


const sort: ChannelSort = { last_updated: -1 };

const options = {
    state: true,
    watch: true,
};

interface IChannelListScreenProps {
}

const ChannelListScreen: React.FC<IChannelListScreenProps> = () => {
    const session = useAuthStore(s => s.session);
    // const { session } = useAuthContext();
    const chatUserId = session?.user.id!;
    const filters: ChannelFilters = {
        members: { $in: [chatUserId] },
        type: "messaging",
    };

    const memoizedFilters: ChannelFilters = useMemo(() => filters, []);
    const router = useRouter();
    const { setChannel } = useContext(AppContext);
    const { client, isOnline } = useChatContext();

    return (
        <LinearGradient
            colors={['$color1', '$color2']}
            start={[0, 0]}
            end={[0, 2]}
            flex={1} h={1000} w='100%'
        >
            <ChannelList filters={memoizedFilters} options={options} sort={sort} onSelect={(channel) => {
                setChannel(channel);
                router.push(`/channel-list/channel/${channel.cid}`);
            }} />
            <Button onPress={() => router.push('/channel-list/(add-chats)')} pos="absolute" b='$5' r='$5' size='$6' circular theme='accent'>
                <Button.Icon>
                    <MessageCirclePlus size='$2' />
                </Button.Icon>
            </Button>
        </LinearGradient>
    );
};

export default ChannelListScreen;
