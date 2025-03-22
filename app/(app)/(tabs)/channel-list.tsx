import { MessageCirclePlus } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Button, View } from 'tamagui';



interface IChannelListScreenProps {
}

const ChannelListScreen: React.FC<IChannelListScreenProps> = () => {

    const router = useRouter();

    return (
        <View flex={1} h={1000} w='100%'>
            <Button onPress={() => router.push('/channel-list/add-chats')} pos="absolute" b='$5' r='$5' size='$7' circular theme='accent'>
                <Button.Icon>
                    <MessageCirclePlus size='$2' />
                </Button.Icon>
            </Button>
        </View>
    );
};

export default ChannelListScreen;
