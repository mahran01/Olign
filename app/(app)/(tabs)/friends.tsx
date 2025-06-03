import React from 'react';
import { View } from 'tamagui';
import AddFriends from '../(private-screens)/channel-list/(add-chats)/(manage-friends)';

interface IFriendsProps {
}

const Friends: React.FC<IFriendsProps> = (props) => {
    return (
        <AddFriends />
    );
};

export default Friends;
