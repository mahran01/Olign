import { useAuthContext } from '@/contexts';
import { BellRing, BookUser, ChevronRight, Info, ListTodo, MessagesSquare } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Button, Text, View, YStack } from 'tamagui';

export const ProfileScreenHeader = () => {
    return (
        <></>
    );
};

interface IProfileScreenProps {
}

const ProfileScreen: React.FC<IProfileScreenProps> = () => {

    const router = useRouter();
    const { session } = useAuthContext();
    const userMetadata = session?.user.user_metadata;
    const { username, name, avatar_uri: avatarUri } = userMetadata || {};

    const settingArray = [
        {
            icon: <BookUser size={24} />,
            text: "Account",
            onPress: () => router.push(`/setup-username/update`),
        },
        {
            icon: <BellRing size={24} />,
            text: "Notification",
        },
        {
            icon: <MessagesSquare size={24} />,
            text: "Chat settings",
        },
        {
            icon: <ListTodo size={24} />,
            text: "Task settings",
        },
        {
            icon: <Info size={24} />,
            text: "About",
        },
    ];

    const createSettingButton = ({ id, icon, text, onPress }: any) => {
        return (
            <Button key={id} onPress={onPress} h='auto' jc='flex-start' w='auto' bg='$background075' pt='$4' pb='$4' ml='$2' mr='$2' mt='$2'>
                <Button.Icon>
                    {icon}
                </Button.Icon>
                <View f={1}>
                    <Text>
                        {text}
                    </Text>
                </View>
                <Button.Icon>
                    <ChevronRight size={16} />
                </Button.Icon>
            </Button>
        );
    };


    return (
        <YStack>
            {settingArray.map((item, index) =>
                createSettingButton({ id: index.toString(), ...item })
            )}
        </YStack>
    );
};

export default ProfileScreen;
