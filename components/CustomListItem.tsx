import React from 'react';
import { View } from 'react-native';
import { ChannelPreviewMessenger, ChannelPreviewMessengerProps } from 'stream-chat-expo';

interface ICustomListItemProps extends ChannelPreviewMessengerProps {
}

const CustomListItem: React.FC<ChannelPreviewMessengerProps> = (props) => {
    const { unread } = props;
    const backgroundColor = unread ? "#e6f7ff" : "#fff";

    return (
        <View style={{ backgroundColor }}>
            <ChannelPreviewMessenger {...props} />
        </View>
    );
};



export default CustomListItem;
