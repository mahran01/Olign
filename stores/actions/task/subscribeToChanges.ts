import { fetchSingleTask, fetchTaskRelatedRecords, fetchMilestoneAssignee } from "@/services";
import { TaskStore } from "@/stores";
import { useAuthStore } from "@/stores/auth.store";
import { GetStateType, SetStateType, supabase } from "@/utils";

export const subscribeToChanges = (set: SetStateType<TaskStore>, get: GetStateType<TaskStore>) => {

    const userId = useAuthStore.getState().session?.user.id;
    if (!userId) return;

    const channel = supabase
        .channel(`task-changes-${userId}`)
        // Listen to INSERT on tasks where the user is an assignee
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'task_assignees',
                filter: `user_id=eq.${userId}`
            },
            async (payload) => {
                const taskId = payload.new.task_id;
                const task = await fetchSingleTask(taskId);
                const {
                    tags: taskTags,
                    assignees: taskAssignees,
                    dependencies: taskDependencies,
                    milestones
                } = await fetchTaskRelatedRecords([taskId]);
                const milestoneAssignees = await fetchMilestoneAssignee(milestones.map(m => m.id));

                set((state) => ({
                    tasks: [...state.tasks, task],
                    tags: [...state.tags, ...taskTags],
                    assignees: [...state.assignees, ...taskAssignees],
                    dependencies: [...state.dependencies, ...taskDependencies],
                    milestones: [...state.milestones, ...milestones],
                    milestoneAssignees: [...state.milestoneAssignees, ...milestoneAssignees],
                    toastMessage: {
                        type: 'success',
                        title: 'New task assigned',
                        message: `${task.title}`,
                    },
                }));
            }
        )
        // Listen to DELETE from tasks
        .on(
            'postgres_changes',
            {
                event: 'DELETE',
                schema: 'public',
                table: 'tasks'
            },
            (payload) => {
                const taskId = payload.old.id;
                set((state) => ({
                    tasks: state.tasks.filter(t => t.id !== taskId),
                    tags: state.tags.filter(t => t.task_id !== taskId),
                    assignees: state.assignees.filter(t => t.task_id !== taskId),
                    dependencies: state.dependencies.filter(t => t.task_id !== taskId),
                    milestones: state.milestones.filter(m => m.task_id !== taskId),
                    milestoneAssignees: state.milestoneAssignees.filter(m => {
                        const parentMilestone = state.milestones.find(ms => ms.id === m.milestone_id);
                        return parentMilestone?.task_id !== taskId;
                    }),
                }));
            }
        )
        // Listen to UPDATE on tasks that are related to the user
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'tasks'
            },
            async (payload) => {
                const updatedTask = payload.new;
                const taskId = updatedTask.id;

                // Check if the user is an assignee of the task
                const isRelated = get().assignees.some(
                    (a) => a.task_id === taskId && a.user_id === userId
                );

                if (!isRelated) return;

                set((state) => ({
                    tasks: state.tasks.map(task =>
                        task.id === updatedTask.id ? { ...task, ...updatedTask } : task
                    )
                }));
            }
        )
        .subscribe();

    return () => {
        channel.unsubscribe();
    };
};