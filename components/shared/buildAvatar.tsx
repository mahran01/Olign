import { Avatar, Text } from "tamagui";

const accentColors = [
    "#FF6B6B", // Red
    "#F06595", // Pink
    "#CC5DE8", // Purple
    "#845EF7", // Indigo
    "#5C7CFA", // Blue
    "#339AF0", // Light Blue
    "#22B8CF", // Cyan
    "#20C997", // Teal
    "#51CF66", // Green
    "#94D82D", // Lime
    "#FCC419", // Yellow
    "#FF922B"  // Orange
];

const buildAvatar = ({ avatarUri, name, size }: { avatarUri: string; name: string; size?: 'small' | 'medium' | 'large'; }) => {
    const bg = accentColors[Math.floor(Math.random() * accentColors.length)];
    const avatarSize = size === 'small' ? '$3' : size === 'medium' ? '$5' : size === 'large' ? '$12' : '$5';
    const fontSize = size === 'small' ? '$5' : size === 'medium' ? '$8' : size === 'large' ? '$12' : '$8';

    return (
        <Avatar circular size={avatarSize}>
            {avatarUri !== '' ? <Avatar.Image
                accessibilityLabel={avatarUri}
                src={avatarUri}
            /> : void (0)}
            {/* <Avatar.Image src={friend.avatarUri} /> */}
            <Avatar.Fallback bg={bg} f={1} jc='center' ai="center">
                <Text fos={fontSize} color='white'>{name?.charAt(0).toUpperCase()}</Text>
            </Avatar.Fallback>
        </Avatar>
    );
};

export default buildAvatar;