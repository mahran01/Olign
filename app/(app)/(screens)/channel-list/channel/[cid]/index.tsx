import React, { useContext, useEffect } from "react";
import { StyleSheet, SafeAreaView } from "react-native";
import { Channel, MessageInput, MessageList, useAttachmentPickerContext } from "stream-chat-expo";
import { Stack, useRouter } from "expo-router";
import { AppContext } from "@/contexts";
import { useHeaderHeight } from "@react-navigation/elements";
import { CustomMessage, Header } from "@/components";
import { Button, Text, useTheme, View } from 'tamagui';
import { EllipsisVertical } from "@tamagui/lucide-icons";

interface IChannelScreenProps {
}

const ChannelScreen: React.FC<IChannelScreenProps> = (props) => {
    const router = useRouter();
    const theme = useTheme();
    const { setThread, channel } = useContext(AppContext);
    const { setTopInset } = useAttachmentPickerContext();
    const headerHeight = useHeaderHeight();

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
        return (
            <Header
                color={color}
                backButton={true}
                title={channel.data!.name}
                right={() => (
                    <Button bg={color} circular={true} icon={<EllipsisVertical size={'$1'} />} />
                )}
            />
        );
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Stack.Screen options={{ header: makeHeader }} />
            {channel ? (
                <Channel channel={channel} audioRecordingEnabled>
                    <MessageList
                        onThreadSelect={(thread) => {
                            setThread(thread);
                            if (channel && thread) {
                                router.push(`/channel/${channel.cid}/thread/${thread.cid}`);
                            }
                        }}
                    />
                    <MessageInput />
                </Channel>
            ) : null}
        </SafeAreaView>
    );
};

export default ChannelScreen;
