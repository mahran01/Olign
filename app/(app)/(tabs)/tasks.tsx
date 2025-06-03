import { AvatarGroup } from '@/components';
import { SingleTask } from '@/components/tasks/SingleTask';
import { TaskAttachmentType } from '@/schemas';
import { UserProfile } from '@/schemas/user.schema';
import { useAuthStore, useProfileStore, useTaskStore } from '@/stores';
import { formatDeadline } from '@/utils';
import { CalendarClock, Check, SquarePen } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Button, Checkbox, ListItem, Separator, Text, View, XStack, YStack, Image, H4, H5 } from 'tamagui';
import { LinearGradient } from 'tamagui/linear-gradient';

interface ITaskListScreenProps {
}

const TasksScreen: React.FunctionComponent<ITaskListScreenProps> = (props) => {

    const taskStore = useTaskStore();
    const profileStore = useProfileStore();
    const userId = useAuthStore.getState().session?.user.id;
    const theme = useColorScheme();
    const router = useRouter();
    const fetchProfile = useProfileStore(e => e.fetchUserProfile);
    const [filter, setFilter] = useState<'assigned' | 'delegated'>('assigned');

    const [taskList, setTaskList] = useState<TaskAttachmentType[]>([]);
    const [relatedProfile, setRelatedProfile] = useState<Record<string, UserProfile>>({});
    const [assignedTaskList, setAssignedTaskList] = useState<TaskAttachmentType[]>([]);
    const [delegatedTaskList, setDelegatedTaskList] = useState<TaskAttachmentType[]>([]);

    useEffect(() => {
        const fetchTaskList = async () => {
            const taskList = (await Promise.all(taskStore.tasks.map(async (e) => await taskStore.fetchTaskAttachment(e.id)))) as TaskAttachmentType[];
            setTaskList(taskList);
            const tmpRecord: Record<string, UserProfile> = {};
            taskList.forEach(async (e) => tmpRecord[e.task.creator_id] = await profileStore.fetchUserProfile(e.task.creator_id));
            setRelatedProfile(tmpRecord);
        };
        fetchTaskList();
    }, []);



    const isLight = theme === 'light';

    const iconBackgroundColor = isLight ? '$accent6' : '$color2';
    const iconColor = isLight ? '$color1' : undefined;
    const backgroundColor = isLight ? '$color2' : '$accent1';
    const separatorColor = isLight ? '$color4' : '$color6';

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

    if (!userId) {
        return (<View>
            <Text>Loading...</Text>
        </View>);
    }

    useEffect(() => {
        setDelegatedTaskList(taskList.filter(e => e.task.creator_id === userId));
        setAssignedTaskList(taskList.filter(e => e.assignees.find(e => e.user_id === userId)));
    }, [taskList]);

    const renderTaskList = () => {
        const listToUse = filter === 'assigned' ? assignedTaskList : delegatedTaskList;
        if (listToUse.length === 0) {
            return (
                <View jc="center" h={320} ai="center" mt='$5'>
                    <View h={200} pb="$5">
                        <Image
                            aspectRatio={1696 / 1503}
                            f={1}
                            source={require('@/assets/friend.png')}
                        />
                    </View>
                    <H4>It's empty</H4>
                    <H5>You have no {filter} task</H5>
                </View>
            );
        }
        else return listToUse
            .sort((a, b) => {
                const aDeadline = a.task.deadline;
                const bDeadline = b.task.deadline;
                const aCompleted = a.task.completed; // or however you track completion
                const bCompleted = b.task.completed;

                // 1. Sort by completion status (incomplete first)
                if (aCompleted && !bCompleted) return 1;
                if (!aCompleted && bCompleted) return -1;

                // 2. Sort by deadline presence (those with deadlines first)
                if (aDeadline && !bDeadline) return -1;
                if (!aDeadline && bDeadline) return 1;

                // 3. Sort by actual deadline if both have one
                if (aDeadline && bDeadline) {
                    return new Date(aDeadline).getTime() - new Date(bDeadline).getTime();
                }

                return 0; // If both don't have deadlines
            })
            .map(e => (
                <SingleTask key={e.task.id} taskAttachment={e} />
            ));
    };

    return (
        <LinearGradient
            colors={['$color1', '$color2']}
            start={[0, 0]}
            end={[0, 2]}
            flex={1} h='100%' w='100%'
        >
            <XStack gap='$3' px='$4' pb='$2'>
                <Button size='$2' theme={filter === 'assigned' ? 'accent' : undefined} onPress={() => setFilter('assigned')}>
                    <Text>Assigned</Text>
                </Button>
                <Button size='$2' theme={filter === 'delegated' ? 'accent' : undefined} onPress={() => setFilter('delegated')}>
                    <Text>Delegated</Text>
                </Button>
            </XStack>
            <ScrollView>
                {renderTaskList()}
            </ScrollView>
        </LinearGradient>
    );
};

export default TasksScreen;
