import { UserPublicProfileType } from "@/models";
import { Check, X } from "@tamagui/lucide-icons";
import React from "react";
import { Button, H4, H5, Image, ListItem, View, XStack, YGroup, YStack } from "tamagui";
import buildAvatar from "../shared/buildAvatar";
import { useFriendStore } from "@/stores";

const buildFriendRequestsList = (isSender: boolean) => {

    const store = useFriendStore();

    const requests = isSender ? store.pendingSentRequests.map(e => ({
        ...e,
        profile: store.userPublicProfiles[e.receiverId]
    })) : store.pendingReceivedRequests.map(e => ({
        ...e,
        profile: store.userPublicProfiles[e.senderId]
    }));

    const { cancelFriendRequest, rejectFriendRequest, acceptFriendRequest } = store;

    //TODO: Add bottom sheet to display profile
    const displayModal = () => {

    };

    //TODO: Add onAccept
    const onAccept = (id: string) => {
        if (!isSender) {
            acceptFriendRequest(id);
        }
    };

    //TODO: Add onDecline
    const onDecline = (id: string) => {
        if (isSender) {
            cancelFriendRequest(id);
            console.log("REMOVED");
        }
        else {
            rejectFriendRequest(id);
        }
    };

    return (
        <YStack>
            {
                requests.length < 1
                    ?
                    <View ai='center'>
                        <View pt='$8' maxWidth={300} mx='$5' jc='center' ai='center'>
                            <View h={200} pb='$5' >
                                <Image aspectRatio={1696 / 1503} f={1} source={{
                                    uri: require('@/assets/friend.png'),
                                }} />
                            </View>
                            {isSender ? (
                                <>
                                    <H4>Zero in the queue?</H4>
                                    <H5 ta='center'>Why request when you are the request</H5><H5>😎👑</H5>
                                </>
                            ) : (
                                <>
                                    <H4>Crickets... 🦗</H4>
                                    <H5 ta='center'>But who needs friends anyway, right?</H5><H5>🧍‍♂️</H5>
                                </>
                            )}
                        </View>
                    </View>
                    :
                    <YGroup bg='$background' gap='$1' padding='$1'>
                        {
                            requests.map(e => {
                                const profile = e.profile;

                                if (!profile) {
                                    return (
                                        <YGroup.Item key={e.id}>
                                            <ListItem title="Loading..." subTitle="Fetching profile..." />
                                        </YGroup.Item>
                                    );
                                }

                                return (
                                    <YGroup.Item key={e.id}>
                                        <ListItem
                                            hoverTheme
                                            pressTheme
                                            icon={
                                                buildAvatar({
                                                    avatarUri: profile.avatarUri ?? "",
                                                    name: profile.name!,
                                                })
                                            }
                                            title={profile.name}
                                            subTitle={'@' + profile.username}
                                            onPress={displayModal}
                                            iconAfter={
                                                <XStack gap='$2'>
                                                    {!isSender && <Button
                                                        circular
                                                        size="$3"
                                                        theme='success'
                                                        bg='$color2'
                                                        color='$color9'
                                                        icon={<Check size='$1' strokeWidth='$0.5' />}
                                                        onPress={() => onAccept(e.id)}
                                                    />}
                                                    <Button circular
                                                        size="$3"
                                                        theme='error'
                                                        bg='$color2'
                                                        color='$color9'
                                                        icon={<X size="$1" strokeWidth='$0.5' />}
                                                        onPress={() => onDecline(e.id)}
                                                    />
                                                </XStack>
                                            }
                                            size='$5'
                                        >
                                        </ListItem>
                                    </YGroup.Item>
                                );
                            })
                        }
                    </YGroup>
            }
        </YStack >
    );
};

export default buildFriendRequestsList;