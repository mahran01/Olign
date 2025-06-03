import { fetchMilestoneAssignee, fetchTaskRelatedRecords, fetchTasksRelatedToUser } from "@/services";
import { useAuthStore } from "@/stores/auth.store";
import { TaskStore } from "@/stores/task.store";
import { retryWithJitter, SetStateType } from "@/utils";

export const fetchAll = async (set: SetStateType<TaskStore>) => {

    const userId = useAuthStore.getState().session?.user.id;
    if (!userId) return;

    const _fetchTask = async () => {
        if (!userId) throw new Error('Invalid session');

        const tasks = await fetchTasksRelatedToUser(userId);

        if (tasks.length < 1) return;

        const taskIds = tasks.map(t => t.id);

        const {
            tags: taskTags,
            assignees: taskAssignees,
            dependencies: taskDependencies,
            milestones,
        } = await fetchTaskRelatedRecords(taskIds);

        const milestoneIds = milestones.map(t => t.id);

        const milestoneAssignees = await fetchMilestoneAssignee(milestoneIds);

        set({
            tasks,
            tags: taskTags,
            assignees: taskAssignees,
            dependencies: taskDependencies,
            milestones,
            milestoneAssignees,
            loading: false,
        });
    };

    try {
        await retryWithJitter(_fetchTask, { name: 'fetchAllTask' });
    } catch (err: any) {
        set({
            error: err.message,
            loading: false,
        });
    }
};
