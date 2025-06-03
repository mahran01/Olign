import { Avatar, AvatarImage, AvatarFallback, XStack, Text } from 'tamagui';
import { AvatarSize, CustomAvatar } from './CustomAvatar';

type AvatarGroupProps = {
    users: { name: string; imageUrl?: string; }[];
    max?: number;
    size?: AvatarSize;
    overlap?: number;
};

export const AvatarGroup = ({
    users,
    max = 2,
    size = 'small',
    overlap = 15,
}: AvatarGroupProps) => {
    const displayedUsers = users.slice(0, max);
    const remaining = users.length - max;

    return (
        <XStack alignItems="center">
            {displayedUsers.map((user, index) => (
                <CustomAvatar
                    key={user.name}
                    uri={user.imageUrl}
                    name={user.name}
                    marginLeft={index === 0 ? 0 : -overlap}
                    zIndex={users.length}
                    size={size}
                />
            ))}
            {remaining > 0 && (
                <CustomAvatar
                    name={`+${Math.min(99, remaining)}`}
                    noLimit
                    bg='$color5'
                    marginLeft={-overlap}
                    zIndex={users.length}
                    size={size}
                />
            )}
        </XStack>
    );
};