

import { Skeleton } from "stream-chat-expo";
import { Avatar, AvatarProps, SizeTokens, Text } from "tamagui";

const accentColors = [
    "#FF6B6B", "#F06595", "#CC5DE8", "#845EF7",
    "#5C7CFA", "#339AF0", "#22B8CF", "#20C997",
    "#51CF66", "#94D82D", "#FCC419", "#FF922B"
];

export type AvatarSize = 'very-small' | 'small' | 'medium' | 'large' | SizeTokens;

interface BaseProps extends Omit<AvatarProps, 'size'> {
    noLimit?: true;
    size?: AvatarSize;
}

interface LoadingAvatarProps extends BaseProps {
    loading: true;
    uri?: never;
    name?: never;
}

interface LoadedAvatarProps extends BaseProps {
    loading?: false;
    uri?: string;
    name: string;
}

type AvatarType = LoadingAvatarProps | LoadedAvatarProps;

const getAvatarSize = (size?: AvatarSize): SizeTokens => {
    switch (size) {
        case 'very-small':
            return '$2';
        case 'small':
            return '$3';
        case 'medium':
            return '$5';
        case 'large':
            return '$12';
        default:
            return typeof size === 'string' ? size : '$5';
    }
};

const getFontSize = (size?: AvatarSize): SizeTokens => {
    switch (size) {
        case 'very-small':
            return '$1';
        case 'small':
            return '$5';
        case 'medium':
            return '$8';
        case 'large':
            return '$12';
        default:
            return '$8';
    }
};

export const CustomAvatar: React.FC<AvatarType> = ({
    loading,
    uri,
    name,
    noLimit,
    size,
    ...props
}) => {
    const avatarSize = getAvatarSize(size);
    const fontSize = getFontSize(size);

    if (loading) {
        return (
            <Avatar circular size={avatarSize} overflow="hidden">
                <Skeleton />
            </Avatar>
        );
    }

    const bg = accentColors[Math.floor(Math.random() * accentColors.length)];

    return (
        <Avatar circular size={avatarSize} overflow="hidden" {...props}>
            {uri && <Avatar.Image accessibilityLabel={uri} src={uri} h='100%' w='100%' />}
            <Avatar.Fallback
                bg={props.bg ?? bg}
                f={1}
                jc="center"
                ai="center"
                h='100%' w='100%'
            >
                <Text fos={noLimit ? undefined : (props.fos ?? fontSize)} color="white">
                    {noLimit ? name : name.charAt(0).toUpperCase()}
                </Text>
            </Avatar.Fallback>
        </Avatar>
    );
};

export default CustomAvatar;
