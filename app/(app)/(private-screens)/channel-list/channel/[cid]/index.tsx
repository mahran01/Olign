import { CustomAttachment, CustomAvatar, CustomMessageInput, Header, MoreOptionsPopover } from "@/components";
import { AppContext } from "@/contexts";
import { useAuthStore } from "@/stores";
import { useHeaderHeight } from "@react-navigation/elements";
import { Archive, EllipsisVertical, Trash2 } from "@tamagui/lucide-icons";
import { Stack, useRouter } from "expo-router";
import React, { useContext, useEffect, useMemo } from "react";
import { SafeAreaView } from "react-native";
import { Channel, MessageList, useAttachmentPickerContext } from "stream-chat-expo";
import { Button, ListItem, Text, useTheme, View, XStack } from 'tamagui';

interface IChannelScreenProps {
}

const ChannelScreen: React.FC<IChannelScreenProps> = (props) => {
    const router = useRouter();
    const theme = useTheme();
    const { setThread, channel } = useContext(AppContext);
    const { setTopInset } = useAttachmentPickerContext();
    const headerHeight = useHeaderHeight();
    const session = useAuthStore(s => s.session);

    useEffect(() => {
        setTopInset(headerHeight);
    }, [headerHeight, setTopInset]);

    if (!channel) {
        return (
            <SafeAreaView>
                <Text>Loading chat ...</Text>
            </SafeAreaView>
        );
    }


    const makeHeader = () => {
        const color = theme.background.val;

        let title: string, image: string | undefined;

        if (channel.data?.name) {
            title = channel.data.name;
            image = channel.data.image as string ?? undefined;
        }
        else {
            // For direct message
            const members = channel.state.members;
            const myId = session?.user.id;

            const otherUser = Object.values(members).find(member => member.user_id !== myId)?.user;

            if (otherUser?.name) {
                title = otherUser.name;
                image = otherUser.image as string ?? undefined;
            }
            else {
                title = 'Invaild Channel';
            }
        }

        const onArchive = async () => {
            try {
                await channel.hide();
                router.replace('/(tabs)');
            } catch (error) {
                console.error('Failed to archive channel:', error);
            }
        };

        const onDelete = async () => {
            try {
                await channel.hide(null, true);
                router.replace('/(tabs)');
            } catch (error) {
                console.error('Failed to delete channel:', error);
            }
        };

        const DeleteChatPopover = () => {
            return (
                <MoreOptionsPopover Icon={<EllipsisVertical size={'$1'} />} placement='bottom-end' >
                    <ListItem
                        icon={<Archive size={'$1'} />}
                        title="Archive Chat"
                        onPress={onArchive}
                        bg='$color1'
                    />
                    <ListItem
                        icon={<Trash2 size={'$1'} color='$red10' />}
                        title={<Text color='$red10'>Delete Chat</Text>}
                        onPress={onDelete}
                        bg='$color1'
                    />
                </MoreOptionsPopover>
            );
        };

        return (
            <Header
                color={color}
                backButton={true}
                backButtonFunction={() => router.replace('/(tabs)')}
                middle={() => (
                    <XStack f={1} ai='center' gap='$3' mx='$1'>
                        <CustomAvatar size='small' name={title} uri={image} />
                        <Text fos={20} >{title}</Text>
                    </XStack>
                )}
                right={() => (
                    <DeleteChatPopover />
                )}
            />
        );
    };

    const header = useMemo(() => makeHeader(), [theme.background.val, channel?.data?.name, channel?.state.members]);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Stack.Screen options={{ header: () => header }} />
            {channel ? (
                <Channel channel={channel} audioRecordingEnabled Card={CustomAttachment}>
                    <MessageList
                        onThreadSelect={(thread) => {
                            setThread(thread);
                            if (channel && thread) {
                                router.push(`channel-list/channel/${channel.cid}/thread/${thread.cid}`);
                            }
                        }}
                    />
                    <CustomMessageInput />
                </Channel>
            ) : null}
        </SafeAreaView>
    );
};

export default ChannelScreen;
