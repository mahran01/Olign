import { TaskAttachmentFetchSchema } from "@/schemas";
import { fetchMilestoneAssignee, fetchSingleTask } from "@/services";
import { TaskStore, } from "@/stores/task.store";
import { useAuthStore } from "@/stores/auth.store";
import { appendIfAny, GetStateType, retryWithJitter, SetStateType, validate } from "@/utils";

export const fetchTaskAttachment: any = async (id: string, refresh = false, get: GetStateType<TaskStore>, set: SetStateType<TaskStore>) => {

    console.log(JSON.stringify({ id, refresh, get, set }));

    const oldData = get().tasks.filter(e => e.id === id);
    const fetchTaskRelatedRecords = get().fetchTaskRelatedRecords;
    if (!refresh && oldData?.length) {

        const task = oldData[0];

        const {
            tags,
            assignees,
            dependencies,
            milestones,
        } = await fetchTaskRelatedRecords(task.id);


        const milestoneIds = milestones?.map((m: any) => m.id);

        const milestoneAssignees = await fetchMilestoneAssignee(milestoneIds);

        return {
            task,
            tags,
            assignees,
            dependencies,
            milestones,
            milestoneAssignees,
        };
    };

    const userId = useAuthStore.getState().session?.user.id;
    if (!userId) return;

    const _fetchTask = async () => {
        if (!userId) throw new Error('Invalid session');

        const task = await fetchSingleTask(id);

        const {
            tags,
            assignees,
            dependencies,
            milestones,
        } = await fetchTaskRelatedRecords(task.id);

        const milestoneIds = milestones.map((m: any) => m.id);

        const milestoneAssignees = await fetchMilestoneAssignee(milestoneIds);

        set(e => ({
            tasks: [...e.tasks, task],
            tags: appendIfAny(e.tags, tags),
            assignees: appendIfAny(e.assignees, assignees),
            dependencies: appendIfAny(e.dependencies, dependencies),
            milestones: appendIfAny(e.milestones, milestones),
            milestoneAssignees: appendIfAny(e.milestoneAssignees, milestoneAssignees),
            loading: false,
        }));

        return {
            task: task,
            tags: tags,
            assignees: assignees,
            dependencies: dependencies,
            milestones: milestones,
            milestoneAssignees: milestoneAssignees,
        };
    };
    try {
        return await retryWithJitter(_fetchTask, { name: 'Fetch a single task' });
    } catch (err: any) {
        set({
            error: err.message,
            loading: false,
        });
    }
};
