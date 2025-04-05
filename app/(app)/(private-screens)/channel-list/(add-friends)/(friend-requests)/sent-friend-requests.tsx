import { buildAvatar } from '@/components';
import { SentFriendRequestType, UserPublicProfileType } from '@/models/';
import { Check, Plus, X } from '@tamagui/lucide-icons';
import React from 'react';
import { Button, H1, H4, H5, ListItem, Text, View, YGroup, YStack, Image, XStack } from 'tamagui';

interface ISentFriendRequestsProps {
}

const SentFriendRequests: React.FC<ISentFriendRequestsProps> = (props) => {
    const sentFriendRequest: SentFriendRequestType[] = [
        { id: 'b3d1d710-8c3a-4f34-bcd7-f22faadf1e01', status: 'pending', receiverId: 'user_1' },
        { id: 'd6fa78f3-315b-4f44-a884-2f4fdcb7b7cb', status: 'pending', receiverId: 'user_2' },
        { id: 'f81243c4-1c3e-4422-bd33-b409b8c9a929', status: 'pending', receiverId: 'user_3' },
        { id: 'e09d63a1-7a4b-4f89-babb-06aa60b8c411', status: 'pending', receiverId: 'user_4' },
        { id: '60e984ab-f058-4e6e-8de5-5e5a5d888abf', status: 'pending', receiverId: 'user_5' },
        { id: 'ec2674f2-110f-4df5-94be-1809c6c1f7c7', status: 'pending', receiverId: 'user_6' },
    ];

    const usersPublicProfile: Record<string, UserPublicProfileType> = {
        user_1: {
            username: 'coolcat123',
            name: 'Cool Cat',
            avatarUri: 'https://example.com/avatar1.png',
        },
        user_2: {
            username: 'techguy',
            name: 'Bob Smith',
            avatarUri: 'https://example.com/avatar2.png',
        },
        user_3: {
            username: 'gamerqueen',
            name: 'Clara Lee',
            avatarUri: 'https://example.com/avatar3.png',
        },
        user_4: {
            username: 'musiclover',
            name: 'Daniel Kim',
            avatarUri: 'https://example.com/avatar4.png',
        },
        user_5: {
            username: 'naturefan',
            name: 'Eva Green',
            avatarUri: 'https://example.com/avatar5.png',
        },
        user_6: {
            username: 'codingninja',
            name: 'Frank Wu',
            avatarUri: 'https://example.com/avatar6.png',
        },
    };
    return (
        <YStack>
            {
                sentFriendRequest.length === 0 ?
                    <View jc='center' h={320} ai='center'>
                        <View h={200} pb='$5'>
                            <Image aspectRatio={1696 / 1503} f={1} source={{
                                uri: require('@/assets/friend.png'),
                            }} />
                        </View>
                        <H4>Add your friend</H4>
                        <H5>Your pending request can be seen here</H5>
                    </View>
                    :
                    <YGroup bg='$background'>
                        {
                            sentFriendRequest.sort((a, b) => {
                                const profileA = usersPublicProfile[a.receiverId];
                                const profileB = usersPublicProfile[b.receiverId];
                                let x = profileA.name!.toLowerCase();
                                let y = profileB.name!.toLowerCase();
                                if (x < y) { return -1; }
                                if (x > y) { return 1; }
                                return 0;
                            }).map((request) => {
                                const profile = usersPublicProfile[request.receiverId];
                                return (
                                    <YGroup.Item key={request.receiverId}>
                                        <ListItem
                                            hoverTheme
                                            pressTheme
                                            icon={
                                                buildAvatar({
                                                    avatarUri: profile.avatarUri!,
                                                    name: profile.name!,
                                                })
                                            }
                                            title={profile.name}
                                            subTitle={'@' + profile.username}
                                            onPress={() => console.log("STAR")}
                                            iconAfter={
                                                <XStack gap='$2'>
                                                    <Button circular size="$2" icon={<Check size="$1" />} />
                                                    <Button circular size="$2" icon={<X size="$1" />} />
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
        </YStack>
    );
};

export default SentFriendRequests;
