import { ToastMessageType } from '@/components';
import {
    MilestoneAssigneeType,
    MilestoneType,
    TaskAssigneeType,
    TaskAttachmentInsertInputType,
    TaskAttachmentType,
    TaskDependencyType,
    TaskTagType,
    TaskType
} from '@/schemas';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { createTask, fetchAll, fetchTaskAttachment, fetchTaskRelatedRecords, markMilestone, subscribeToChanges } from './actions/task';
import { markTask } from './actions/task/markTask';

export type TaskState = {
    tasks: TaskType[];
    tags: TaskTagType[];
    assignees: TaskAssigneeType[];
    dependencies: TaskDependencyType[];
    milestones: MilestoneType[];
    milestoneAssignees: MilestoneAssigneeType[];
    loading: boolean;
    error: string | null;
    toastMessage: ToastMessageType | null;
};

export type TaskAction = {
    resetToastMessage: () => void;
    fetchAll: () => Promise<void>;
    fetchTaskAttachment: (id: string, refresh?: boolean) => Promise<any>;
    fetchTaskRelatedRecords: (id: string, refresh?: boolean) => Promise<any>;
    createTask: (taskAttachment: TaskAttachmentInsertInputType, channel: any) => Promise<TaskAttachmentType | null>;
    markMilestone: (milestoneId: string, assigneeId: string, completion: boolean) => Promise<void>;
    markTask: (taskId: string, assigneeId: string, completion: boolean) => Promise<void>;
    subscribeToChanges: () => void;
};

export type TaskStore = TaskState & TaskAction;

const defaultInitState: TaskState = {
    tasks: [],
    tags: [],
    assignees: [],
    dependencies: [],
    milestones: [],
    milestoneAssignees: [],
    loading: true,
    error: null,
    toastMessage: null,
};

export const useTaskStore = create<TaskStore>()(
    devtools(
        persist(
            (set, get) => ({
                ...defaultInitState,

                resetToastMessage: () => {
                    set({ toastMessage: null });
                },

                fetchAll: () => fetchAll(set),

                fetchTaskAttachment: (id, refresh = false) => fetchTaskAttachment(id, refresh, get, set),

                fetchTaskRelatedRecords: (id, useExistingData = false) => fetchTaskRelatedRecords(id, useExistingData, get, set),

                createTask: (taskAttachment, channel) => createTask(taskAttachment, channel, set),

                markMilestone: async (milestoneId, assigneeId, completion) => markMilestone(milestoneId, assigneeId, completion, set, get),

                markTask: async (taskId, assigneeId, completion) => markTask(taskId, assigneeId, completion, set, get),

                subscribeToChanges: () => subscribeToChanges(set, get),
            }),
            {
                name: 'task-store',
                storage: createJSONStorage(() => AsyncStorage),
            }
        )
    )
);