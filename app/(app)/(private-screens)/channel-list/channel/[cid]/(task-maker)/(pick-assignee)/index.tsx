import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, View, ScrollView, Text, useTheme, Label } from 'tamagui';
import { FriendList, HorizontalSelectedUserList, Header } from '@/components';
import { Check } from '@tamagui/lucide-icons';
import { useAssigneePickerStore } from '@/stores/';
import { LinearGradient } from 'tamagui/linear-gradient';
import rnuuid from 'react-native-uuid';

export default function PickAssigneeScreen() {
    const router = useRouter();
    const { memberIds, onSelectAssignees, initialSelected } = useAssigneePickerStore();
    const theme = useTheme();

    const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected ?? []));

    const makeHeader = () => {
        const color = theme.background.val;

        return (
            <Header
                color={color}
                backButton
                backButtonFunction={() => {
                    onSelectAssignees?.(Array.from(selected));
                    router.back();
                }}
                title="Select Assignees"
                right={() => (
                    <View px='$3' py='$2' onPress={() => router.back()}>
                        <Text fos='$5'>Cancel</Text>
                    </View>
                )}
            />
        );
    };

    return (
        <LinearGradient
            colors={['$color1', '$color2']}
            start={[0, 0]}
            end={[0, 2]}
            flex={1} h='100%' w='100%'
        >
            <Stack.Screen options={{ header: makeHeader }} />
            <View f={1} px="$3" pt="$2">
                <HorizontalSelectedUserList selectedUserIds={selected} />
                <ScrollView f={1}>
                    <FriendList
                        friends={memberIds.map(e => ({ id: rnuuid.v4(), friendId: e }))}
                        selected={selected}
                        friendOnPress={(id) => {
                            if (!id) return;
                            const newSet = new Set(selected);
                            newSet.has(id) ? newSet.delete(id) : newSet.add(id);
                            setSelected(newSet);
                        }}
                    />
                </ScrollView>
            </View>
        </LinearGradient >
    );
}