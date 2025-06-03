import { FriendList, Header, HorizontalSelectedUserList } from '@/components';
import { useAuthStore, useProfileStore } from '@/stores';
import { Check } from '@tamagui/lucide-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Button, ScrollView, useTheme, View, Text } from 'tamagui';
import { LinearGradient } from 'tamagui/linear-gradient';

interface ICreateChannelProps { }

const CreateChannel: React.FC<ICreateChannelProps> = () => {
    const router = useRouter();
    const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set<string>());
    const theme = useTheme();

    const session = useAuthStore(e => e.session);

    const makeHeader = () => (
        <Header color={theme.background.val} backButton={true} title='Add member' />
    );

    return (
        <LinearGradient colors={['$color1', '$color2']} start={[0, 0]} end={[0, 2]} flex={1} h={1000} w='100%'>
            <Stack.Screen options={{ header: makeHeader }} />
            <View w='100%' h='100%' px='$2'>
                <View>
                    <Text px='$2' py='$3'>Selected Members:</Text>
                    <HorizontalSelectedUserList selectedUserIds={selectedMembers} />
                </View>
                <ScrollView f={1} w='100%'>
                    <FriendList
                        selected={selectedMembers}
                        friendOnPress={(friendId) => {
                            if (friendId) {
                                setSelectedMembers(prev => {
                                    const newSet = new Set(prev);
                                    newSet.has(friendId) ? newSet.delete(friendId) : newSet.add(friendId);
                                    return newSet;
                                });
                            }
                        }}
                    />

                </ScrollView>
            </View>
            <Button
                onPress={() => {
                    if (!session?.user.id) return;
                    const memberArray = [...selectedMembers, session.user.id];
                    const encoded = encodeURIComponent(JSON.stringify(memberArray));
                    router.push(`channel-list/create-channel/(metadata)?members=${encoded}`);
                }}
                pos="absolute"
                b="$5"
                r="$5"
                size="$6"
                circular
                theme="accent"
            >
                <Button.Icon>
                    <Check size='$2' />
                </Button.Icon>
            </Button>
        </LinearGradient>
    );
};

export default CreateChannel;
