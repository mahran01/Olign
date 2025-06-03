import { TaskAttachmentType } from "@/schemas";
import { useAuthStore, useProfileStore } from "@/stores";
import React, { useEffect, useState } from "react";
import { Checkbox, ListItem, Separator, Text, View, XStack, YStack } from "tamagui";
import CustomAvatar from "../shared/CustomAvatar";
import { useColorScheme } from "react-native";
import { formatDeadline } from "@/utils";
import { Check } from "@tamagui/lucide-icons";
import { UserProfile } from "@/schemas/user.schema";
import { useRouter } from "expo-router";

export const SingleTask = ({ taskAttachment }: { taskAttachment: TaskAttachmentType; }) => {
    const router = useRouter();
    const fetchProfile = useProfileStore(e => e.fetchUserProfile);
    const { task, assignees, milestones, milestoneAssignees } = taskAttachment;
    const [avatarGroup, setAvatarGroup] = useState<any>([]);
    const [creatorProfile, setCreatorProfile] = useState<UserProfile>();
    const theme = useColorScheme();
    const userId = useAuthStore.getState().session?.user.id;

    const isLight = theme === 'light';

    const iconBackgroundColor = isLight ? '$accent6' : '$color2';
    const iconColor = isLight ? '$color1' : undefined;
    const backgroundColor = isLight ? '$color2' : '$accent1';
    const separatorColor = isLight ? '$color4' : '$color6';
    const buttonTextColor = isLight ? '$color9' : '$accent11';

    const getDeadlineDue = (deadline?: Date | null) => {
        if (!deadline || !deadline.getDate) return 'upcoming';
        if (deadline < new Date()) return 'overdue';
        if (deadline.getDate() === new Date().getDate()) return 'today';
        if (deadline > new Date()) return 'upcoming';
        return 'upcoming';
    };

    const deadlineColor = {
        overdue: 'red',
        upcoming: '$green9',
        today: isLight ? '$accent6' : '$color3',
    };

    useEffect(() => {
        const fetchCreatorProfile = async () => {
            const profile = await fetchProfile(task.creator_id);
            setCreatorProfile(profile);
        };
        fetchCreatorProfile();
    }, []);

    useEffect(() => {
        const fetchAvatarGroup = async () => {
            if (assignees.length) {
                const avatarGroup = assignees.map(async (assignee) => {
                    const profile = await fetchProfile(assignee.user_id);

                    return ({
                        name: profile.name,
                        imageUrl: profile.avatar_uri
                    });
                });
                setAvatarGroup(await Promise.all(avatarGroup));
            }
        };
        fetchAvatarGroup();
    }, [assignees]);

    if (!creatorProfile?.name || !creatorProfile?.avatar_uri) {
        return (
            <ListItem key={task.id}>
                <CustomAvatar loading />
            </ListItem>
        );
    }
    if (!userId) return;

    const isCreator = task.creator_id === userId;
    const userIsAssigned = assignees.find(e => e.user_id === userId);
    const userMilestoneAssignee = milestoneAssignees?.filter(e => e.user_id === userId);
    const userIsAssignedToMilestone = (userMilestoneAssignee ?? []).length > 0;

    const viewTask = () => {

        const params = new URLSearchParams({
            taskAttachment: JSON.stringify(taskAttachment),
            readOnly: JSON.stringify(true)
        });
        router.push(`/channel-list/channel/(task-maker)?${params.toString()}`);

    };

    return (
        <View mx='$2'>
            <ListItem key={task.id} my='$1' br='$5' px={0}
                pressTheme
                onPress={viewTask} >
                <YStack f={1}>
                    <XStack px='$2' gap='$2'>
                        <CustomAvatar name={creatorProfile.name} uri={creatorProfile.avatar_uri} />

                        <YStack gap='$2' f={1} jc='center'>
                            <Text fow='700' fontSize='$4' px='$1'>{task.title}</Text>
                            {task.deadline && (
                                <XStack>
                                    <Text br='$7' px='$3' py='$1' fos='$2'
                                        bg={deadlineColor[getDeadlineDue(task.deadline)]} color='whitesmoke' fow='700'
                                    >
                                        {formatDeadline(task.deadline)}
                                    </Text>
                                </XStack>
                            )}
                        </YStack>
                    </XStack>
                    {!userIsAssigned ? (
                        <>
                            <Separator borderColor={separatorColor} mt='$2' mb='$2' />
                            <XStack px='$2' ai='center' jc='space-between'>
                                <Text fontStyle='italic' fontSize='$4'>{creatorProfile.name} assigned you to this task</Text>
                                <Checkbox id={task.id} size='$5'>
                                    <Checkbox.Indicator>
                                        <Check />
                                    </Checkbox.Indicator>
                                </Checkbox>
                            </XStack>
                            {!!userIsAssignedToMilestone && !!userMilestoneAssignee?.length && userMilestoneAssignee.map(ma => {
                                const milestone = milestones?.find(m => m.id === ma.milestone_id);
                                return (
                                    <View key={ma.id}>
                                        <Separator borderColor={separatorColor} mt='$2' mb='$2' />
                                        <XStack px='$2' ai='center' jc='space-between'>
                                            <Text pl='$4' fontWeight={700} fontSize='$3'>{(milestones && milestones?.length > 0) ? milestone?.title : ''}</Text>
                                            <Checkbox id={milestone?.id} size='$5'>
                                                <Checkbox.Indicator>
                                                    <Check />
                                                </Checkbox.Indicator>
                                            </Checkbox>
                                        </XStack>
                                    </View>
                                );
                            })}
                            <Separator borderColor={separatorColor} mt='$2' mb='$2' />
                        </>
                    ) : <></>}
                </YStack>
            </ListItem>
        </View>
    );
};