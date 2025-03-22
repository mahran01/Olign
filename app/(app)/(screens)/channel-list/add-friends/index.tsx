import { buildAvatar, buildListItem } from '@/components';
import { AtSign, Plus, UserRoundCog, UserRoundSearch } from '@tamagui/lucide-icons';
import { Stack } from 'expo-router';
import React from 'react';
import { Button, H5, ListItem, ScrollView, YGroup, YStack } from 'tamagui';

interface ISearchFriendProps {
}

const SearchFriend: React.FC<ISearchFriendProps> = (props) => {
    const friends = [
        {
            avatarUri: "",
            name: "John Doe",
            username: "johndoe"
        },
        {
            avatarUri: "",
            name: "Jane Smith",
            username: "janesmith"
        },
        {
            avatarUri: "",
            name: "Michael Johnson",
            username: "michaeljohnson"
        },
        {
            avatarUri: "",
            name: "Emily Davis",
            username: "emilydavis"
        },
        {
            avatarUri: "",
            name: "David Brown",
            username: "davidbrown"
        },
        {
            avatarUri: "",
            name: "Sophia Wilson",
            username: "sophiawilson"
        },
        {
            avatarUri: "",
            name: "James Lee",
            username: "jameslee"
        },
        {
            avatarUri: "",
            name: "Olivia Harris",
            username: "oliviaharris"
        },
        {
            avatarUri: "",
            name: "William Clark",
            username: "williamclark"
        },
        {
            avatarUri: "",
            name: "Isabella Allen",
            username: "isabellaallen"
        }
    ];

    return (
        <>
            <Stack.Screen options={{ title: "Add Friends" }} />

            <ScrollView>
                <YStack p='$4' h='100%' bg='$background'>
                    <YGroup bg='$background'>
                        {buildListItem({
                            icon: <UserRoundSearch size='$1' />,
                            title: "Find Your Friends",
                            onPress: () => console.log("STAR")
                        })}
                        {buildListItem({
                            icon: <UserRoundCog size='$1' />,
                            title: "Friend Requests",
                            subtitle: "0 sent, 0 received",
                            onPress: () => console.log("STAR")
                        })}
                        {buildListItem({
                            icon: <AtSign size='$1' />,
                            title: "Add by Username",
                            onPress: () => console.log("STAR")
                        })}
                    </YGroup>
                    <H5 px='$2' pt='$5' pb='$3'>People you might know</H5>

                    {/* <ScrollView br='$5'> */}
                    <YGroup bg='$background'>
                        {
                            friends.sort((a, b) => {
                                let x = a.name.toLowerCase();
                                let y = b.name.toLowerCase();
                                if (x < y) { return -1; }
                                if (x > y) { return 1; }
                                return 0;
                            }).map((friend) => (
                                <YGroup.Item key={friend.username}>
                                    <ListItem
                                        hoverTheme
                                        pressTheme
                                        icon={
                                            buildAvatar({
                                                avatarUri: friend.avatarUri,
                                                name: friend.name,
                                            })
                                        }
                                        title={friend.name}
                                        subTitle={'@' + friend.username}
                                        onPress={() => console.log("STAR")}
                                        iconAfter={
                                            <Button circular size="$2" icon={<Plus size="$1" />} />
                                        }
                                        size='$5'
                                    />
                                </YGroup.Item>
                            ))
                        }
                    </YGroup>
                </YStack >
            </ScrollView>
        </>
    );
};

export default SearchFriend;
