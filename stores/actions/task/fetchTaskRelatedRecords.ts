import { TaskAttachmentType } from "@/schemas";
import { fetchTaskRelatedRecords as fetchTaskRelatedRecordsService } from "@/services";
import { TaskStore } from "@/stores/task.store";
import { GetStateType, SetStateType } from "@/utils";


export const fetchTaskRelatedRecords = async (id: string, useExistingData = false, get: GetStateType<TaskStore>, set: SetStateType<TaskStore>) => {

    if (useExistingData) {

        const state = get();

        const oldRecord: Omit<TaskAttachmentType, 'task'> = {
            tags: state.tags.filter(e => e.task_id === id[0]),
            assignees: state.assignees.filter(e => e.task_id === id[0]),
            dependencies: state.dependencies.filter(e => e.task_id === id[0]),
            milestones: state.milestones.filter(e => e.task_id === id[0]),
        };
        const milestoneIds = oldRecord.milestones?.map(m => m.id);
        if (milestoneIds) {

            const milestoneAssignees = state.milestoneAssignees.filter(e => e.milestone_id in milestoneIds);
            oldRecord['milestoneAssignees'] = milestoneAssignees;
        }
        return oldRecord;
    };

    return await fetchTaskRelatedRecordsService([id]);
};