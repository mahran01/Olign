import { Check, MessageCircle } from '@tamagui/lucide-icons';
import React, { useEffect, useState } from 'react';
import { H4, H5, View, YGroup, Image } from 'tamagui';
import UserList from './UserList';
import { useFriendStore, useProfileStore } from '@/stores';
import { FriendType } from '@/models';

interface IFriendListProps {
    friends?: FriendType[];
    fallback?: React.ReactNode;
    isLoading?: boolean;
    friendOnPress?: (friendId?: string) => void;
    icon?: React.ReactElement;
    selected?: Set<string>;
}

const FriendList: React.FC<IFriendListProps> = (props) => {
    const store = useFriendStore();
    const {
        friends = store.friends,
        fallback,
        isLoading = store.loading,
        friendOnPress,
        icon,
        selected,
    } = props;
    const getProfile = useProfileStore(e => e.fetchUserProfile);

    const [groupedFriends, setGroupedFriends] = useState<Record<string, { friend: FriendType; name: string; avatarUri?: string; }[]>>({});

    useEffect(() => {
        const groupAndSortFriends = async () => {
            const tempGroups: Record<string, { friend: FriendType; name: string; avatarUri?: string; }[]> = {};

            for (const friend of friends) {
                const { name, avatar_uri } = await getProfile(friend.friendId);
                if (!name) continue;

                const firstChar = name.charAt(0).toUpperCase();
                let category: string;

                if (/[^A-Za-z0-9]/.test(firstChar)) {
                    category = 'Symbols';
                } else if (/[0-9]/.test(firstChar)) {
                    category = 'Numbers';
                } else {
                    category = firstChar;
                }

                if (!tempGroups[category]) tempGroups[category] = [];
                tempGroups[category].push({ friend, name, avatarUri: avatar_uri ?? '' });
            }

            // Sort each category by name
            for (const category in tempGroups) {
                tempGroups[category].sort((a, b) => a.name.localeCompare(b.name));
            }

            setGroupedFriends(tempGroups);
        };

        if (!isLoading && friends.length > 0) {
            groupAndSortFriends();
        }
    }, [friends, isLoading, getProfile]);

    if (isLoading) {
        return (
            <YGroup bg="$background" gap="$2">
                {[...Array(3)].map((_, i) => (
                    <UserList key={i} loading />
                ))}
            </YGroup>
        );
    }

    if (friends.length < 1) {
        return (
            fallback ?? (
                <View jc="center" h={320} ai="center">
                    <View h={200} pb="$5">
                        <Image
                            aspectRatio={1696 / 1503}
                            f={1}
                            source={require('@/assets/friend.png')}
                        />
                    </View>
                    <H4>It's empty</H4>
                    <H5>Start by adding your friends</H5>
                </View>
            )
        );
    }

    const sortedCategories = Object.keys(groupedFriends).sort((a, b) => {
        if (a === 'Symbols') return -1;
        if (b === 'Symbols') return 1;
        if (a === 'Numbers') return -1;
        if (b === 'Numbers') return 1;
        return a.localeCompare(b);
    });

    return (
        <>
            {sortedCategories.map((category) => (
                <React.Fragment key={category}>
                    <H5 px="$3" pt="$2" pb="$2">{category}</H5>
                    <YGroup bg="$background">
                        {groupedFriends[category].map(({ friend, name, avatarUri }) => (
                            <UserList
                                key={friend.friendId}
                                id={friend.friendId}
                                name={name}
                                avatarUri={avatarUri ?? ''}
                                onPress={() => friendOnPress?.(friend.friendId)}
                                icon={
                                    selected?.has(friend.friendId)
                                        ? <View bg='$green8' br={10000} p='$1'><Check size='$1' color='white' /></View>
                                        : icon ?? undefined
                                }
                                bg={
                                    selected?.has(friend.friendId)
                                        ? '$green5' : undefined
                                }
                            />
                        ))}
                    </YGroup>
                </React.Fragment>
            ))}
        </>
    );
};

export default FriendList;
