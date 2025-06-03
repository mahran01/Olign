import React, { useEffect, useState } from 'react';
import { UserProfileType } from '@/schemas';
import { useProfileStore } from '@/stores';
import { Card, Label, View, Text, Avatar, AvatarImage, XStack, Button, Unspaced } from 'tamagui';
import { Skeleton } from 'stream-chat-expo';
import CustomAvatar from './CustomAvatar';
import { Plus } from '@tamagui/lucide-icons';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'tamagui/linear-gradient';
import { BlurView } from 'expo-blur';

const SelectedUser = ({ id }: { id: string; }) => {
    const [profile, setProfile] = useState<UserProfileType | null>(null);
    const getProfile = useProfileStore(e => e.fetchUserProfile);

    useEffect(() => {
        let cancelled = false;
        getProfile(id).then((data) => {
            if (!cancelled) setProfile(data);
        });
        return () => {
            cancelled = true;
        };
    }, [id]);

    if (!profile) {
        return (
            <View w='$7' p='$1' f={1} jc='space-around' ai='center' key={id}>
                <CustomAvatar loading size="small" />
                <View h='$1' my='$2' br={9999} overflow='hidden' w='100%' >
                    <Skeleton />
                </View>
            </View>
        );
    }

    return (
        <View w='$7' p='$1' f={1} jc='space-around' ai='center' key={id}>
            <CustomAvatar name={profile.name ?? ''} size="small" uri={profile.avatar_uri ?? ''} />
            <View h='$3' jc='center'>
                <Label fos={'$1'} fow="bold" color="$color9" lh='$1' numberOfLines={2} ta='center'>
                    {profile.name}
                </Label>
            </View>
        </View>
    );
};


interface HorizontalSelectedUserListProps {
    selectedUserIds: Set<string>;
    addButton?: boolean;
    addButtonOnpress?: () => void;
    readOnly?: boolean;
}

export const HorizontalSelectedUserList: React.FC<HorizontalSelectedUserListProps> = ({ readOnly, selectedUserIds, addButton, addButtonOnpress }) => {
    if (selectedUserIds.size === 0 && !addButton) return null;

    return (
        <XStack w='100%'>
            {!readOnly && addButton && (
                <View>
                    <Card w='$7' bg='$colorTransparent' p='$1' jc='space-around' ai='center' onPress={addButtonOnpress} pressTheme>
                        <Button circular size='$3' onPress={addButtonOnpress} >
                            <Plus />
                        </Button>
                        <View h='$3' jc='center'>
                            <Text fos={'$1'} fow="bold" color="$color9" lh='$1' numberOfLines={2} ta='center'>
                                {'Add\nMore'}
                            </Text>
                        </View>
                    </Card>
                </View>
            )}
            <View f={1}>
                <ScrollView horizontal scrollEnabled>
                    {[...selectedUserIds].map(id => (
                        <SelectedUser key={id} id={id} />
                    ))}
                </ScrollView>
            </View>
        </XStack>
    );
};
