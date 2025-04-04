import React from 'react';
import { H1, Text, View } from 'tamagui';

interface ISentFriendRequestsProps {
}

const SentFriendRequests: React.FC<ISentFriendRequestsProps> = (props) => {
    return (
        <View><H1>Sent</H1></View>
    );
};

export default SentFriendRequests;
