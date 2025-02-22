
import { useFriendContext } from '@/contexts/FriendContext';
import { useUserContext } from '@/contexts/UserContext';
import { ChevronRight, MessageCirclePlus, MessageSquarePlus, MessagesSquare, Star, UserRoundPlus } from '@tamagui/lucide-icons';
import { Stack } from 'expo-router';
import * as React from 'react';
import { H3, H4, H5, ListItem, ScrollView, Separator, Text, View, YGroup, YStack } from 'tamagui';

interface IAddChatProps {
}

const AddChat: React.FC<IAddChatProps> = (props) => {

    const { handleAddFriend, friends, pendingRequest, receivedRequest } = useFriendContext();
    const { getUserIdByUsername, userProfile } = useUserContext();

    const buildItem = ({ icon, title, subtitle, onPress }: any) => (
        <YGroup.Item>
            <ListItem
                hoverTheme
                pressTheme
                icon={icon}
                title={title}
                subTitle={subtitle}
                onPress={onPress}
                iconAfter={ChevronRight}
            />
        </YGroup.Item>
    );

    return (
        <>
            <Stack.Screen options={{ title: "Add Chats" }} />
            <ScrollView f={1} p='$2' w='100%' h={100} bg='$background'>
                <YGroup my='$3'>
                    {buildItem({
                        icon: UserRoundPlus,
                        title: "Add friends",
                        subtitle: "Find your friends",
                        onPress: async () => {
                            const addFriend = async () => {
                                const id = await getUserIdByUsername("m6mah_ran");
                                if (id) {
                                    console.log(id);
                                    console.log(userProfile?.user_id);


                                    handleAddFriend(id);
                                    console.log('Friend Added');
                                }
                            };
                            await addFriend();
                            console.log("Add User");
                        }
                    })}
                    {buildItem({
                        icon: MessagesSquare,
                        title: "Add Existing Channel",
                        subtitle: "Browse existing channels",
                        onPress: () => console.log("STAR")
                    })}
                    {buildItem({
                        icon: MessageSquarePlus,
                        title: "Create New Channel",
                        subtitle: "Create your own channel",
                        onPress: () => console.log("STAR")
                    })}
                </YGroup>
                <H5 px='$2'>Start messaging your friends</H5>
                <Separator m='$2' />
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
            </ScrollView>
        </>
    );
};

export default AddChat;
