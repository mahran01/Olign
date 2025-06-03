// import { useAuthContext } from "@/contexts";
import { useAuthStore } from "@/stores";
import React from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";
import { Chat, DeepPartial, MessageList, OverlayProvider, Theme, useCreateChatClient } from 'stream-chat-expo';
import { useTheme } from "tamagui";

const ChatWrapper: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const { streamData: { apiKey, token }, session } = useAuthStore();
    const theme = useTheme();
    const colorScheme = useColorScheme();
    const light = colorScheme !== 'dark';

    if (!apiKey || !token || !session) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size={'small'} />
            </View>
        );
    }

    const user = {
        id: session.user.id,
        name: session.user.user_metadata.name,
    };

    const chatClient = useCreateChatClient({
        apiKey,
        userData: user,
        tokenOrProvider: token,
    });

    if (!chatClient) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size={'small'} />
            </View>
        );
    }

    const chatTheme: DeepPartial<Theme> = {
        colors: {

            // 🎨 ACCENTS (buttons, icons, links, etc.)
            accent_blue: theme.accentBackground.val,
            accent_dark_blue: theme.accentColor.val,
            accent_info: theme.accentColor.val,       // Assuming this is a blue-ish info, just use same
            accent_green: theme.green9.val,            // Online status or confirmation color
            accent_error: theme.red9.val,              // Error
            accent_red: theme.red9.val,              // Possibly for destructive actions

            // 🧱 BACKGROUNDS / SURFACES
            white: theme.color1.val,
            icon_background: theme.color2.val,
            white_smoke: theme.background02.val,
            white_snow: theme.background.val,
            bg_gradient_start: theme.color1.val,
            bg_gradient_end: theme.color2.val,
            bg_user: theme.background02.val,
            grey_gainsboro: theme.background04.val,
            grey_whisper: theme.background06.val,

            // 📝 TEXT EMPHASIS
            text_high_emphasis: theme.color.val,
            text_low_emphasis: theme.color8.val,

            // 🧩 BORDERS / DIVIDERS / CODE
            border: theme.borderColor.val,
            code_block: theme.background08.val,

            // 🧑‍🦽 STATES / DISABLED
            disabled: theme.color6.val,

            // 🪞 SHADOWS / OVERLAYS
            modal_shadow: theme.shadowColor.val,
            overlay: theme.color10.val,
            shadow_icon: theme.shadowColor.val,

            // ✨ OTHER SPECIAL CASES
            targetedMessageBackground: theme.yellow3.val,
            transparent: 'transparent',

            black: theme.color.val,

            light_gray: theme.color3.val, // Message - received

            light_blue: light ? theme.accent12.val : theme.accent4.val, // Message - send

            blue_alice: light ? theme.accent12.val : theme.accent4.val, // Custom Attachment - send

            //   grey: '#7A7A7A', // Subtitle
            //   label_bg_transparent: '#00000033', // 33 = 20% opacity
            //   grey_dark: '#72767E',
            //   static_black: '#000000',
            //   static_white: '#ffffff',

        },

        channelListMessenger: {
            flatList: {
                backgroundColor: 'tranparent',
            },
            flatListContent: { //ChannelList
                backgroundColor: 'tranparent',
            },
        },
        // messageSimple: {
        //     content: {
        //         messageUser: {
        //             fontSize: 12,
        //             fontWeight: '700',
        //             paddingRight: 6,
        //             color: 'white'
        //         },
        //         metaText: {
        //             fontSize: 20,
        //             color: 'white'
        //         },
        //     },
        // }
        // channelPreview: {
        //     container: {
        //         backgroundColor: theme.background.val,
        //     },
        //     contentContainer: {
        //         backgroundColor: theme.background.val,
        //     },
        //     title: {
        //         color: theme.color.val,
        //     },
        // },
        // messageList: {
        //     container: {
        //         backgroundColor: theme.background.val,
        //     },
        //     messageContainer: {
        //         backgroundColor: theme.background.val,
        //     },
        //     listContainer: {
        //         backgroundColor: theme.background.val,
        //     },
        // },
        messageSimple: {
            // container: {
            //     backgroundColor: 'red',
            // },
            // replies: {
            //     container: {
            //         backgroundColor: 'red',
            //     }
            // }
        },
        // reply: {
        //     container: {
        //         backgroundColor: 'red',
        //     },
        //     messageContainer: {
        //         backgroundColor: 'red',
        //     },
        //     textContainer: {
        //         backgroundColor: 'red',
        //     },
        // }
    };

    return (
        <OverlayProvider value={{ style: chatTheme }}>
            <Chat client={chatClient}>
                {children}
            </Chat>
        </OverlayProvider>
    );
};

export default ChatWrapper;
