import { supabase } from '@/utils/supabase';
import { TaskStore } from "@/stores/task.store";
import { GetStateType, SetStateType } from "@/utils";

export const markTask = async (
    taskId: string,
    assigneeUserId: string,
    completion: boolean,
    set: SetStateType<TaskStore>,
    get: GetStateType<TaskStore>
) => {

    console.log('task_id: ', taskId);
    console.log('assignee_user_id: ', assigneeUserId);

    const { error } = await supabase
        .from('task_assignees')
        .update({ completed: completion })
        .eq('task_id', taskId)
        .eq('user_id', assigneeUserId);

    console.log('after supabase');
    if (error) {
        console.error('Failed to mark task:', error);
        return;
    }
    console.log('after error');

    // Optional: update local state
    const assignees = get().assignees;
    const updatedTasks = assignees.map(assignee => {
        if (assignee.user_id === assigneeUserId && assignee.task_id === taskId) {
            return { ...assignee, completed: completion };
        }
        return assignee;
    });

    set({ assignees: updatedTasks });
};
