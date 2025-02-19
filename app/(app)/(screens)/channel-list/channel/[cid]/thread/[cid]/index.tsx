import React, { useContext } from "react";
import { SafeAreaView, Text, View, StyleSheet } from "react-native";
import { Channel, Thread } from "stream-chat-expo";
import { Stack } from "expo-router";
import { AppContext } from "@/contexts";
import { useHeaderHeight } from "@react-navigation/elements";


interface IAppProps {
}

const ThreadScreen: React.FC<IAppProps> = () => {
    const { channel, thread, setThread } = useContext(AppContext);
    const headerHeight = useHeaderHeight();

    if (channel === undefined || channel === null) {
        return (
            <SafeAreaView>
                <Text>Loading chat ...</Text>
            </SafeAreaView>
        );
    }

    return (
        <>
            <Stack.Screen options={{ title: "Thread Screen" }} />

            <Channel
                channel={channel}
                thread={thread}
                threadList
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: "flex-start",
                    }}
                >
                    <Thread
                        onThreadDismount={() => {
                            setThread(null);
                        }}
                    />
                </View>
            </Channel>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default ThreadScreen;
