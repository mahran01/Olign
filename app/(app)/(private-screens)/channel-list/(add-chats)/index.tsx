import { buildListItem, UserList } from '@/components';
import { AppContext, useAuthContext } from '@/contexts';
import { useFriendStore } from '@/stores';
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
    const { friends, pendingSentRequests, pendingReceivedRequests, userPublicProfiles, loading: isLoading } = useFriendStore();
    const toast = useToastController();
    const [isCreatingChannel, setIsCreatingChannel] = useState(false);
    const { session } = useAuthContext();
    const { client, isOnline } = useChatContext();
    const { setChannel } = useContext(AppContext);

    // TODO: Create event when clicked, need to look into stream API
    const addChat = (friendId: string) => {

        const createChannel = async () => {
            if (!session?.user.id) return;

            setIsCreatingChannel(true);
            try {
                const channel = client.channel("messaging", {
                    members: [session.user.id, friendId],
                });
                await channel.create();
                await channel.watch();
                setChannel(channel);
                router.push(`/channel/${channel.cid}`);
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
                            onPress: () => router.push('/(manage-friends)')
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
                            onPress: () => router.push('/(create-channel)')
                        })}
                    </YGroup>
                    <H5 px="$2" pt="$5" pb="$3">Start Messaging Your Friends</H5>
                    {(() => {
                        if (isLoading) {
                            return (
                                <YGroup bg="$background" gap='$2'>
                                    {[...Array(3)].map((_, i) => (
                                        <UserList loading />
                                    ))}
                                </YGroup>
                            );
                        }

                        const groupedFriends: Record<string, typeof friends> = {};

                        friends.forEach((friend) => {
                            const name = userPublicProfiles[friend.friendId].name;

                            if (!name) return;

                            const firstChar = name.charAt(0).toUpperCase();
                            let category: string;

                            if (/[^A-Za-z0-9]/.test(firstChar)) {
                                category = "Symbols";
                            } else if (/[0-9]/.test(firstChar)) {
                                category = "Numbers";
                            } else {
                                category = firstChar; // Alphabet group
                            }

                            if (!groupedFriends[category]) groupedFriends[category] = [];
                            groupedFriends[category].push(friend);
                        });

                        const sortedCategories = Object.keys(groupedFriends).sort((a, b) => {
                            if (a === "Symbols") return -1;
                            if (b === "Symbols") return 1;
                            if (a === "Numbers") return -1;
                            if (b === "Numbers") return 1;
                            return a.localeCompare(b);
                        });

                        return sortedCategories.map((category) => (
                            <React.Fragment key={category}>
                                <H5 px="$3" pt="$3" pb="$2">{category}</H5>
                                <YGroup bg="$background">
                                    {groupedFriends[category]
                                        .sort((a, b) => {
                                            const nameA = userPublicProfiles[a.friendId].name;
                                            const nameB = userPublicProfiles[b.friendId].name;

                                            if (!nameA || !nameB) return 0;

                                            return nameA.localeCompare(nameB);
                                        })
                                        .map((friend) => {
                                            const { friendId } = friend;
                                            const { name, avatarUri } = userPublicProfiles[friendId];
                                            if (!name) return <UserList key={friendId} loading />;
                                            return (
                                                <UserList
                                                    key={friendId}
                                                    id={friendId}
                                                    name={name}
                                                    avatarUri={avatarUri ?? ""}
                                                    icon={<MessageCircle onPress={() => addChat(friendId)} />}
                                                />
                                            );
                                        })
                                    }
                                </YGroup>
                            </React.Fragment>
                        ));
                    })()}
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
