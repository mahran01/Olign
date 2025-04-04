import React from 'react';
import { H1, View } from 'tamagui';

interface IReceivedFriendRequestsProps {
}

const ReceivedFriendRequests: React.FC<IReceivedFriendRequestsProps> = (props) => {
    return (
        <View><H1>Received</H1></View>
    );
};

export default ReceivedFriendRequests;
