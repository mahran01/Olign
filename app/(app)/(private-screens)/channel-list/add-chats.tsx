import { buildAvatar, buildListItem } from '@/components';
import { useFriendContext, useUserContext } from '@/contexts';
import { MessageCircle, MessageSquarePlus, MessagesSquare, UserRoundPlus } from '@tamagui/lucide-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { H5, ListItem, ScrollView, YGroup, YStack } from 'tamagui';

interface IAddChatProps {
}

const AddChat: React.FC<IAddChatProps> = (props) => {
    const router = useRouter();
    const { friends: friend2, pendingRequest, receivedRequest } = useFriendContext();
    const friends: { avatarUri: string, name: string, username: string; }[] = [
        // {
        //     avatarUri: "",
        //     name: "John Doe",
        //     username: "johndoe"
        // },
        // {
        //     avatarUri: "",
        //     name: "Jane Smith",
        //     username: "janesmith"
        // },
        // {
        //     avatarUri: "",
        //     name: "Michael Johnson",
        //     username: "michaeljohnson"
        // },
        // {
        //     avatarUri: "",
        //     name: "Emily Davis",
        //     username: "emilydavis"
        // },
        // {
        //     avatarUri: "",
        //     name: "David Brown",
        //     username: "davidbrown"
        // },
        // {
        //     avatarUri: "",
        //     name: "Sophia Wilson",
        //     username: "sophiawilson"
        // },
        // {
        //     avatarUri: "",
        //     name: "James Lee",
        //     username: "jameslee"
        // },
        // {
        //     avatarUri: "",
        //     name: "Olivia Harris",
        //     username: "oliviaharris"
        // },
        // {
        //     avatarUri: "",
        //     name: "William Clark",
        //     username: "williamclark"
        // },
        // {
        //     avatarUri: "",
        //     name: "Isabella Allen",
        //     username: "isabellaallen"
        // }
    ];

    return (
        <>
            <Stack.Screen options={{ title: "Add Chats" }} />
            <ScrollView>
                <YStack p='$4' h='100%' bg='$background'>
                    <YGroup>
                        {buildListItem({
                            icon: <UserRoundPlus size='$1' />,
                            title: "Add friends",
                            // subtitle: "Find your friends",
                            onPress: () => router.push('/channel-list/(add-friends)')
                        })}
                        {buildListItem({
                            icon: <MessagesSquare size='$1' />,
                            title: "Add Existing Channel",
                            // subtitle: "Browse existing channels",
                            onPress: () => console.log("STAR")
                        })}
                        {buildListItem({
                            icon: <MessageSquarePlus size='$1' />,
                            title: "Create New Channel",
                            // subtitle: "Create your own channel",
                            onPress: () => console.log("STAR")
                        })}
                    </YGroup>
                    <H5 px="$2" pt="$5" pb="$3">Start Messaging Your Friends</H5>
                    {(() => {
                        // Define the type for groupedFriends
                        const groupedFriends: Record<string, typeof friends> = {};

                        friends.forEach((friend) => {
                            const firstChar = friend.name.charAt(0).toUpperCase();
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

                        // Sort categories: Symbols first, Numbers second, A-Z last
                        // const sortedCategories = Object.keys(groupedFriends).sort((a, b) => {
                        //     if (a === "Symbols") return -1;
                        //     if (b === "Symbols") return 1;
                        //     if (a === "Numbers") return -1;
                        //     if (b === "Numbers") return 1;
                        //     return a.localeCompare(b);
                        // });

                        return Object.keys(groupedFriends).map((category) => (
                            <React.Fragment key={category}>
                                <H5 px="$3" pt="$3" pb="$2">{category}</H5>
                                <YGroup bg="$background">
                                    {groupedFriends[category]
                                        .sort((a, b) => a.name.localeCompare(b.name)) // Sort within the group
                                        .map((friend) => (
                                            <YGroup.Item key={friend.username}>
                                                <ListItem
                                                    size="$5"
                                                    hoverTheme
                                                    pressTheme
                                                    icon={buildAvatar({
                                                        avatarUri: friend.avatarUri,
                                                        name: friend.name,
                                                        size: "small",
                                                    })}
                                                    title={friend.name}
                                                    onPress={() => console.log("STAR")}
                                                    iconAfter={<MessageCircle size="$1" />}
                                                />
                                            </YGroup.Item>
                                        ))}
                                </YGroup>
                            </React.Fragment>
                        ));
                    })()}
                    <YGroup px='$4'>
                        <YGroup.Item>
                            <H5>Friends: [ {friends?.toString()} ]</H5>
                        </YGroup.Item>
                        <YGroup.Item>
                            <H5>Pending: [ {pendingRequest?.toString()} ]</H5>
                        </YGroup.Item>
                        <YGroup.Item>
                            <H5>Received: [ {receivedRequest?.toString()} ]</H5>
                        </YGroup.Item>
                    </YGroup>
                </YStack>
            </ScrollView>
        </>
    );
};

export default AddChat;
