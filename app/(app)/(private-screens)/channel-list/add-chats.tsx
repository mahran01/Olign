import { buildAvatar, buildListItem } from '@/components';
import { useFriendContext, useUserContext } from '@/contexts';
import { useFriendStore } from '@/stores';
import { MessageCircle, MessageSquarePlus, MessagesSquare, UserRoundPlus } from '@tamagui/lucide-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { H5, ListItem, ScrollView, YGroup, YStack } from 'tamagui';

interface IAddChatsProps {
}

const AddChats: React.FC<IAddChatsProps> = (props) => {
    const router = useRouter();
    const { friends, pendingSentRequests, pendingReceivedRequests, userPublicProfiles } = useFriendStore();

    // TODO: Create event when clicked, need to look into stream API
    const addChat = (friendId: string) => {

    };

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
                        const groupedFriends: Record<string, typeof friends> = {};

                        friends.forEach((friend) => {
                            const firstChar = userPublicProfiles[friend.friendId].name!.charAt(0).toUpperCase();
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
                                            const nameA = userPublicProfiles[a.friendId].name!;
                                            const nameB = userPublicProfiles[b.friendId].name!;
                                            return nameA.localeCompare(nameB);
                                        })
                                        .map((friend) => {
                                            const { friendId } = friend;
                                            const { name, username, avatarUri } = userPublicProfiles[friendId];
                                            return (
                                                <YGroup.Item key={friend.friendId}>
                                                    <ListItem
                                                        size="$5"
                                                        hoverTheme
                                                        pressTheme
                                                        icon={buildAvatar({
                                                            avatarUri: avatarUri!,
                                                            name: name!,
                                                            size: "small",
                                                        })}
                                                        title={name}
                                                        onPress={() => addChat(friendId)}
                                                        iconAfter={<MessageCircle size="$1" />}
                                                    />
                                                </YGroup.Item>
                                            );
                                        }

                                        )}
                                </YGroup>
                            </React.Fragment>
                        ));
                    })()}
                    <YGroup px='$4'>
                        <YGroup.Item>
                            <H5>Friends: [ {friends?.toString()} ]</H5>
                        </YGroup.Item>
                        <YGroup.Item>
                            <H5>Pending: [ {pendingSentRequests?.toString()} ]</H5>
                        </YGroup.Item>
                        <YGroup.Item>
                            <H5>Received: [ {pendingReceivedRequests?.toString()} ]</H5>
                        </YGroup.Item>
                    </YGroup>
                </YStack>
            </ScrollView>
        </>
    );
};

export default AddChats;
