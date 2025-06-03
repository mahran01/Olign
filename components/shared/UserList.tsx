
import React, { ReactNode } from 'react';
import { Skeleton } from "stream-chat-expo";
import { View, YGroup, ListItem, YStack } from "tamagui";
import { CustomAvatar } from "./CustomAvatar";

type UserListType = {
    loading?: never;
    id: string;
    name: string;
    avatarUri: string;
    onPress?: () => void;
    icon?: JSX.Element;
    bg?: string;
} | {
    loading: true;
    id?: never;
    name?: never;
    avatarUri?: never;
    onPress?: never;
    icon?: never;
    bg?: string;
};

const _buildUserList = (props: UserListType) => {
    if (props.loading) {
        return (
            <YGroup.Item>
                <ListItem
                    size="$5"
                    icon={<CustomAvatar loading size='small' />}
                >
                    <YStack>
                        <View h='$1.5' br={9999} mb='$2' overflow='hidden' w='60%'><Skeleton /></View>
                        <View h='$1' br={9999} overflow='hidden' w='40%'><Skeleton /></View>
                    </YStack>
                </ListItem>
            </YGroup.Item>
        );
    }

    const { id, name, avatarUri, onPress, icon, bg } = props;

    return (
        <YGroup.Item key={id}>
            <ListItem
                size="$5"
                hoverTheme
                pressTheme
                icon={<CustomAvatar uri={avatarUri} name={name} size='small' />}
                title={name}
                onPress={onPress}
                iconAfter={icon}
                bg={bg}
            >
            </ListItem>
        </YGroup.Item>
    );
};

const UserList: React.FC<UserListType> = (props) => {
    return _buildUserList(props);
};

export default UserList;