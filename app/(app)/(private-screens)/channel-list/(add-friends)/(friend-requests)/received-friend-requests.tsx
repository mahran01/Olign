import { buildFriendRequestList } from '@/components';
import { useFriendStore } from '@/stores';
import React from 'react';

interface IReceivedFriendRequests {
}

const ReceivedFriendRequests: React.FC<IReceivedFriendRequests> = (props) => {

    return buildFriendRequestList(false);
};

export default ReceivedFriendRequests;
