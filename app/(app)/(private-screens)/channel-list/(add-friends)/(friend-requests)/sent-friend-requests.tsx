import { buildFriendRequestList } from '@/components';
import { useFriendStore } from '@/stores';
import React from 'react';

interface ISentFriendRequestsProps {
}

const SentFriendRequests: React.FC<ISentFriendRequestsProps> = (props) => {

    return buildFriendRequestList(true);
};

export default SentFriendRequests;
