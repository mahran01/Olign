import { TaskAttachmentFetchSchema, TaskAttachmentInsertSchema, TaskAttachmentType } from "@/schemas";
import { insertTaskWithRelatedData } from "@/services";
import { TaskStore } from "@/stores/task.store";
import { appendIfAny, retryWithJitter, SetStateType, supabase, validate } from "@/utils";

export const createTask = async (taskAttachment: unknown, channel: any, set: SetStateType<TaskStore>) => {

    const insertTask = async () => {
        return await insertTaskWithRelatedData(taskAttachment);
    };

    const sendMessage = async (validated: TaskAttachmentType) => {

        const task = validated.task;
        // 3. Prepare and send message to Stream Chat
        const message = {
            custom_type: 'task',
            attachments: [
                {
                    type: 'task',
                    id: task.id,
                },
            ],
        };
        await channel.sendMessage(message);
    };

    try {
        const validatedResult = await retryWithJitter(insertTask, { name: 'insertTask' });
        await retryWithJitter(async () => await sendMessage(validatedResult), { name: 'sendMessage' });

        set((state) => ({
            tasks: [...state.tasks, validatedResult.task],
            tags: appendIfAny(state.tags, validatedResult.tags),
            assignees: appendIfAny(state.assignees, validatedResult.assignees),
            dependencies: appendIfAny(state.dependencies, validatedResult.dependencies),
            milestones: appendIfAny(state.milestones, validatedResult.milestones),
            milestoneAssignees: appendIfAny(state.milestoneAssignees, validatedResult.milestoneAssignees),
            toastMessage: {
                type: 'small',
                title: 'Task created successfully',
            }
        }));
        return validatedResult;
    } catch (err: any) {
        set({ error: err.message, loading: false });
        return null;
    }
};