import { AddFriendByUsernameDialog, buildAvatar, buildListItem } from '@/components';
import { useFriendStore } from '@/stores';
import { AtSign, ContactRound, Plus, UserRoundCog } from '@tamagui/lucide-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Button, H4, H5, Image, ListItem, Switch, View, YGroup, YStack } from 'tamagui';

interface IAddFriendsProps {
}

const AddFriends: React.FC<IAddFriendsProps> = (props) => {

    const router = useRouter();
    const [checked, setChecked] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const { pendingReceivedRequests, pendingSentRequests } = useFriendStore();

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
            <Stack.Screen options={{ title: "Add Friends" }} />
            <AddFriendByUsernameDialog open={openDialog} setOpen={setOpenDialog} />
            <YStack p='$4' h='100%' bg='$background'>

                <YGroup bg='$background'>
                    <YGroup.Item>
                        <ListItem
                            hoverTheme
                            pressTheme
                            icon={<ContactRound size='$1' />}
                            size='$5'
                        >
                            <YStack f={1}>
                                <ListItem.Text size='$5'>Sync Contact Number</ListItem.Text>
                                <ListItem.Subtitle size='$5'>Sync is {checked ? "enabled" : "disabled"}</ListItem.Subtitle>
                            </YStack>

                            <Switch checked={checked} onCheckedChange={setChecked} bg={checked ? '$accentColor' : '$gray6'}>
                                <Switch.Thumb animation='quicker' bg={checked ? 'whitesmoke' : 'whitesmoke'} />
                            </Switch>
                        </ListItem>
                    </YGroup.Item>
                    {buildListItem({
                        icon: <UserRoundCog size='$1' />,
                        title: "Friend Requests",
                        subtitle: `${pendingSentRequests.length} sent, ${pendingReceivedRequests.length} received`,
                        onPress: () => router.push('/channel-list/(friend-requests)')
                    })}
                    {buildListItem({
                        icon: <AtSign size='$1' />,
                        title: "Add by Username",
                        onPress: () => setOpenDialog(true)
                    })}
                </YGroup>

                {/* People you might know section */}
                <H5 px='$2' pt='$5' pb='$3'>People you might know</H5>

                {
                    friends.length === 0 ?
                        <View jc='center' h={320} ai='center'>
                            <View h={200} pb='$5'>
                                <Image aspectRatio={1696 / 1503} f={1} source={{
                                    uri: require('@/assets/friend.png'),
                                }} />
                            </View>
                            <H4>Sync your contact</H4>
                            <H5>and find people you might know</H5>
                        </View>
                        :
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
                }
            </YStack >
        </>
    );
};

export default AddFriends;
