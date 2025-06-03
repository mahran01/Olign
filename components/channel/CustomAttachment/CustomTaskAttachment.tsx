import { View, Text, YStack, XStack, Separator, ListItem, Checkbox } from 'tamagui';
import type { AttachmentProps } from 'stream-chat-expo';
import { TaskAttachmentInsertInputType, TaskAttachmentType } from '@/schemas';
import { formatDeadline } from '@/utils';
import { useColorScheme } from 'react-native';
import { Calendar, CalendarClock, Check, SquarePen } from '@tamagui/lucide-icons';
import { useAuthStore, useProfileStore, useTaskStore } from '@/stores';
import { AvatarGroup } from '@/components/shared/AvatarGroup';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/contexts';
import { normalizeFetchedAttachment } from '@/schemas/task.schema';
import { AssigneeCheckbox } from '@/components/shared/AssigneeCheckbox';

export const CustomTaskAttachment = ({ taskAttachment }: { taskAttachment: TaskAttachmentType; }) => {

    const router = useRouter();
    const theme = useColorScheme();
    const userId = useAuthStore.getState().session?.user.id;
    const fetchProfile = useProfileStore(e => e.fetchUserProfile);
    const [avatarGroup, setAvatarGroup] = useState<any>([]);
    const { channel } = useAppContext();
    const taskStore = useTaskStore();

    const { task, assignees, milestones, milestoneAssignees } = taskAttachment;

    if (!userId || !channel) return;

    const isCreator = task.creator_id === userId;
    const userIsAssigned = assignees.find(e => e.user_id === userId);
    const userMilestoneAssignee = milestoneAssignees?.filter(e => e.user_id === userId);
    const userIsAssignedToMilestone = (userMilestoneAssignee ?? []).length > 0;

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

    const isLight = theme === 'light';

    const iconBackgroundColor = isLight ? '$accent6' : '$color2';
    const iconColor = isLight ? '$color1' : undefined;
    const backgroundColor = isLight ? '$color2' : '$accent1';
    const separatorColor = isLight ? '$color4' : '$color6';
    const buttonTextColor = isLight ? '$color9' : '$accent11';

    const getDeadlineDue = (deadline?: Date | null) => {
        if (!deadline) return 'upcoming';
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

    return (
        <YStack w='$20' pt='$2' bg={backgroundColor} m='$1' br='$6' overflow='hidden'>
            <XStack ai='center'>
                <View br={999999} p='$2' mx='$2' bg={iconBackgroundColor} aspectRatio={1} ai='center' w='$3'>
                    <CalendarClock color={iconColor} size='$1' />
                </View>
                <YStack gap='$2'>
                    <Text fow='700' fontSize='$4' px='$1'>{task.title}</Text>
                    {task.deadline ? (
                        <XStack>
                            <Text br='$7' px='$3' py='$1' fos='$2' bg={deadlineColor[getDeadlineDue(task.deadline)]} color='whitesmoke' fow='700'>{formatDeadline(task.deadline)}</Text>
                        </XStack>
                    ) : <></>}
                </YStack>
            </XStack>
            <Separator borderColor={separatorColor} mt='$3' mb='$2' />
            {userIsAssigned && (
                <>
                    <AssigneeCheckbox
                        id={task.id}
                        label="You're assigned to this task"
                        initial={assignees.find(e => e.user_id === userId)?.completed ?? false}
                        onToggle={async (c) => {
                            await taskStore.markTask(task.id, userId, c);
                        }}
                    />
                    {userIsAssignedToMilestone && !!userMilestoneAssignee?.length && userMilestoneAssignee.map(ma => {
                        const milestone = milestones?.find(m => m.id === ma.milestone_id);
                        return milestone ? (
                            <View key={ma.id}>
                                <Separator borderColor={separatorColor} mt='$2' mb='$2' />
                                <AssigneeCheckbox
                                    id={milestone.id}
                                    label={milestone.title}
                                    initial={ma.completed ?? false}
                                    onToggle={async (c) => {
                                        await taskStore.markMilestone(milestone.id, userId, c);
                                    }}
                                />
                            </View>
                        ) : null;
                    })}
                    <Separator borderColor={separatorColor} mt='$2' mb='$2' />
                </>
            )}

            {avatarGroup?.length > 0 && (
                <XStack px='$2' ai='center'>
                    <AvatarGroup users={avatarGroup} size='very-small' />
                    <Text pl='$2' fs={1} numberOfLines={1} fos='$2'>{avatarGroup[0].name}</Text>
                    {assignees.length === 1 ? (
                        <Text fos='$2'> is assigned</Text>
                    ) : (
                        <Text numberOfLines={1} fos='$2'>+{assignees.length - 1} more are assigned</Text>
                    )}
                </XStack>
            )}
            {isCreator ? (
                <>
                    <Separator borderColor={separatorColor} mt='$2' mb={0} />
                    <ListItem
                        pressTheme
                        size='$3'
                        bg={backgroundColor}
                        jc='center'
                        gap='$3'
                        onPress={() => {
                            const params = new URLSearchParams({
                                taskAttachment: JSON.stringify(taskAttachment),
                                readOnly: JSON.stringify(false)
                            });
                            router.push(`/channel-list/channel/${channel.cid}/(task-maker)?${params.toString()}`);
                        }}
                    >
                        <Text color={buttonTextColor}>Edit Task</Text>
                        <SquarePen size={15} color={buttonTextColor} />
                    </ListItem>
                </>
            ) : (
                <>
                    <Separator borderColor={separatorColor} mt='$2' mb={0} />
                    <ListItem
                        pressTheme
                        size='$3'
                        bg={backgroundColor}
                        jc='center'
                        gap='$3'
                        onPress={() => {
                            const params = new URLSearchParams({
                                taskAttachment: JSON.stringify(taskAttachment),
                                readOnly: JSON.stringify(true)
                            });
                            router.push(`/channel-list/channel/${channel.cid}/(task-maker)?${params.toString()}`);
                        }}
                    >
                        <Text color='$accent11'>View Task</Text>
                    </ListItem>
                </>
            )}
        </YStack>
    );

    return null;
};;
