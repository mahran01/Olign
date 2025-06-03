import { supabase } from '@/utils/supabase';
import { TaskStore } from "@/stores/task.store";
import { GetStateType, SetStateType } from "@/utils";

export const markMilestone = async (
    milestoneId: string,
    assigneeUserId: string,
    completion: boolean,
    set: SetStateType<TaskStore>,
    get: GetStateType<TaskStore>
) => {
    const { error } = await supabase
        .from('milestone_assignees')
        .update({ completed: completion })
        .eq('milestone_id', milestoneId)
        .eq('user_id', assigneeUserId);

    if (error) {
        console.error('Failed to mark milestone:', error);
        return;
    }

    // Optional: update local state
    const milestoneAssignees = get().milestoneAssignees;
    const updatedMilestones = milestoneAssignees.map(ma => {
        if (ma.milestone_id === milestoneId && ma.user_id === assigneeUserId) {
            return { ...ma, completed: completion };
        }
        return ma;
    });

    set({ milestoneAssignees: updatedMilestones });
};