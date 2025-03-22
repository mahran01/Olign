import { useAuthContext } from "@/contexts";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { Chat, OverlayProvider, useCreateChatClient } from 'stream-chat-expo';
import { useTheme } from "tamagui";

const ChatWrapper: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const { streamData: { apiKey, token }, session } = useAuthContext();
    const theme = useTheme();

    if (!apiKey || !token || !session) {
        return (
            <View>
                <ActivityIndicator size={'small'} style={{ margin: 28 }} />
            </View>
        );
    }

    const user = {
        id: session.user.id,
        name: session.user.user_metadata.name,
    };

    const chatClient = useCreateChatClient({
        apiKey: apiKey,
        userData: user,
        tokenOrProvider: token,
    });

    if (!chatClient) {
        return (
            <View>
                <ActivityIndicator size={'small'} style={{ margin: 28 }} />
            </View>
        );
    }

    const chatTheme = {
        channelListMessenger: {
            flatList: {
                backgroundColor: theme.background.val,
            },
            flatListContent: {
                backgroundColor: theme.background.val,
            },
        },
        channelPreview: {
            container: {
                backgroundColor: theme.background.val,
            },
            contentContainer: {
                backgroundColor: theme.background.val,
            },
            title: {
                color: theme.color.val,
            },
        },
    };

    return (
        <OverlayProvider value={{ style: chatTheme }}>
            <Chat client={chatClient}>{children}</Chat>
        </OverlayProvider>
    );
};

export default ChatWrapper;