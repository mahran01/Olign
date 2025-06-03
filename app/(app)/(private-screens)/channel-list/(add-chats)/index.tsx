import { buildListItem, FriendList, UserList } from '@/components';
// import { AppContext, useAuthContext } from '@/contexts';
import { AppContext } from '@/contexts';
import { useAuthStore, useFriendStore } from '@/stores';
import { MessageCircle, MessageSquarePlus, MessagesSquare, UserRoundPlus } from '@tamagui/lucide-icons';
import { useToastController } from '@tamagui/toast';
import { Stack, useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { useChatContext } from 'stream-chat-expo';
import { H5, ScrollView, YGroup, YStack } from 'tamagui';

interface IAddChatsProps {
}

const AddChats: React.FC<IAddChatsProps> = (props) => {
    const router = useRouter();
    const toast = useToastController();
    const [isCreatingChannel, setIsCreatingChannel] = useState(false);
    const session = useAuthStore(s => s.session);
    // const { session } = useAuthContext();
    const { client, isOnline } = useChatContext();
    const { setChannel } = useContext(AppContext);

    const addChat = (friendId: string) => {

        const createChannel = async () => {
            if (!session?.user.id) return;

            setIsCreatingChannel(true);
            try {
                const channel = client.channel("messaging", {
                    members: [session.user.id, friendId],
                    is_direct: true,
                });
                await channel.create();
                await channel.watch();
                setChannel(channel);
                router.push(`/channel-list/channel/${channel.cid}`);
            } catch (error) {
                console.error('Error creating channel:', error);
            } finally {
                setIsCreatingChannel(false);
            }
        };

        createChannel();
    };

    return (
        <>
            <Stack.Screen options={{ title: "Add Chats" }} />
            <ScrollView>
                <YStack p='$4' h='100%' bg='$background'>
                    <YGroup>
                        {buildListItem({
                            icon: <UserRoundPlus size='$1' />,
                            title: "Manage friends",
                            // subtitle: "Find your friends",
                            onPress: () => router.push('channel-list/(manage-friends)')
                        })}
                        {buildListItem({
                            icon: <MessagesSquare size='$1' />,
                            title: "Add Existing Channel",
                            // subtitle: "Browse existing channels",
                            onPress: () => {
                                toast.show('Friend request blocked', {
                                    message: 'You must wait 7 days before sending another request to this user.',
                                });
                            }
                        })}
                        {buildListItem({
                            icon: <MessageSquarePlus size='$1' />,
                            title: "Create New Channel",
                            // subtitle: "Create your own channel",
                            onPress: () => router.push('channel-list/create-channel/(members)')
                        })}
                    </YGroup>
                    <H5 px="$2" pt="$5" pb="$3">Start Messaging Your Friends</H5>
                    <FriendList friendOnPress={(id) => id ? addChat(id) : null} />
                    {/* TODO: Delete */}
                    {/* <YGroup px='$4'>
                        <YGroup.Item>
                            <H5>Friends: [ {friends?.toString()} ]</H5>
                        </YGroup.Item>
                        <YGroup.Item>
                            <H5>Pending: [ {pendingSentRequests?.toString()} ]</H5>
                        </YGroup.Item>
                        <YGroup.Item>
                            <H5>Received: [ {pendingReceivedRequests?.toString()} ]</H5>
                        </YGroup.Item>
                    </YGroup> */}
                </YStack>
            </ScrollView>
        </>
    );
};

export default AddChats;
