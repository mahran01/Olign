// task.schemas.ts
import { z } from 'zod';
import { zDateInput, zDateInputOptional, zISODate, zDateISO, zDateISOOptional, zISODateOptional } from './helper.schema';
import rnuuid from 'react-native-uuid';
// Helpers

// -------------------------
// TASKS
// -------------------------
export const TaskInsertInputSchema = z.object({
    title: z.string().trim().min(1, { message: 'Task name is required' }).max(50, { message: 'Task name must be 50 characters or less' }),
    description: z.string().trim().max(255, { message: 'Description must not exceed 255 characters' }).optional().nullable(),
    completed: z.boolean().default(false).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional().nullable(),
    deadline: zDateInputOptional,
    recurrence: z.any().optional().nullable(),
    creator_id: z.string().uuid().trim(),
});

export const TaskInsertSchema = TaskInsertInputSchema.transform((data) => ({
    ...data,
    deadline: data.deadline ? data.deadline.toISOString() : null,
}));

export const TaskUpdateInputSchema = TaskInsertInputSchema.partial();

export const TaskUpdateSchema = TaskUpdateInputSchema.transform((data) => ({
    ...data,
    deadline: data.deadline ? data.deadline.toISOString() : null,
}));

export const TaskFetchSchema = z.object({
    id: z.string().uuid(),
    created_at: zISODate,
    updated_at: zISODateOptional,
    ...TaskInsertInputSchema.shape,
    deadline: zISODateOptional,
});

// -------------------------
// TASK TAGS
// -------------------------
export const TaskTagInsertSchema = z.object({
    task_id: z.string().uuid().trim(),
    tag: z.string().trim(),
});

export const TaskTagUpdateSchema = TaskTagInsertSchema.partial();

export const TaskTagFetchSchema = z.object({
    id: z.string().uuid(),
    ...TaskTagInsertSchema.shape,
});

// -------------------------
// TASK ASSIGNEES
// -------------------------
export const TaskAssigneeInsertSchema = z.object({
    task_id: z.string().uuid().trim(),
    user_id: z.string().uuid().trim(),
    completed: z.boolean().default(false).optional(),
});

export const TaskAssigneeUpdateSchema = TaskAssigneeInsertSchema.partial();

export const TaskAssigneeFetchSchema = z.object({
    id: z.string().uuid(),
    ...TaskAssigneeInsertSchema.shape,
});

// -------------------------
// TASK DEPENDENCIES
// -------------------------
export const TaskDependencyInsertSchema = z.object({
    task_id: z.string().uuid().trim(),
    depends_on_task_id: z.string().uuid().trim(),
});

export const TaskDependencyUpdateSchema = TaskDependencyInsertSchema.partial();

export const TaskDependencyFetchSchema = z.object({
    id: z.string().uuid(),
    ...TaskDependencyInsertSchema.shape,
});

// -------------------------
// MILESTONES
// -------------------------
const MAX_MILESTONE = 10;

export const MilestoneInsertInputSchema = z.object({
    task_id: z.string().uuid().trim(),
    // Smallint type range MAX = 32767
    index: z.number().int().min(0, { message: 'Index must be a positive integer' }).max(MAX_MILESTONE, { message: `Milestone amount is cappeed at ${MAX_MILESTONE}` }),
    title: z.string().trim().min(1, { message: 'Milestone name is required' }).max(50, { message: 'Milestone name must be 50 characters or less' }),
    description: z.string().trim().max(255, { message: 'Description must not exceed 255 characters' }).optional().nullable(),
    completed: z.boolean().default(false).optional(),
    deadline: zDateInputOptional,
});

export const MilestoneInsertSchema = MilestoneInsertInputSchema.transform((data) => ({
    ...data,
    deadline: data.deadline ? data.deadline.toISOString() : null,
}));

export const MilestoneUpdateInputSchema = MilestoneInsertInputSchema.partial();

export const MilestoneUpdateSchema = MilestoneUpdateInputSchema.transform((data) => ({
    ...data,
    deadline: data.deadline ? data.deadline.toISOString() : null,
}));

export const MilestoneFetchSchema = z.object({
    id: z.string().uuid(),
    ...MilestoneInsertInputSchema.shape,
    deadline: zISODateOptional
});

// -------------------------
// MILESTONE ASSIGNEES
// -------------------------
export const MilestoneAssigneeInsertSchema = z.object({
    milestone_id: z.string().uuid().trim(),
    user_id: z.string().uuid().trim(),
    completed: z.boolean().default(false).optional(),
});

export const MilestoneAssigneeUpdateSchema = MilestoneAssigneeInsertSchema.partial();

export const MilestoneAssigneeFetchSchema = z.object({
    id: z.string().uuid(),
    ...MilestoneAssigneeInsertSchema.shape,
});


// -------------------------
// TASK ATTACHMENT
// -------------------------
export const TaskAttachmentInsertInputSchema = z.object({
    task: TaskInsertInputSchema,
    tags: z.array(TaskTagInsertSchema.omit({ task_id: true })).optional().nullable(),
    assignees: z.array(TaskAssigneeInsertSchema.omit({ task_id: true })).min(1, { message: 'At least one assignee is required' }),
    dependencies: z.array(TaskDependencyInsertSchema.omit({ task_id: true })).optional().nullable(),
    milestones: z.array(
        z.object({
            temporary_id: z.string().uuid(),
            milestone: MilestoneInsertInputSchema.omit({ task_id: true, index: true }),
            assignees: z.array(MilestoneAssigneeInsertSchema.omit({ milestone_id: true })).optional().nullable(),
        })
    ).optional().nullable(),
});

export const TaskAttachmentInsertSchema = TaskAttachmentInsertInputSchema.transform((data) => {
    const taskDeadline = data.task.deadline instanceof Date
        ? data.task.deadline.toISOString()
        : null;

    return ({
        ...data,
        task: {
            ...data.task,
            deadline: taskDeadline,
        },
        milestones: data.milestones?.map((m, index) => {
            const milestoneDeadline =
                m.milestone.deadline instanceof Date
                    ? m.milestone.deadline.toISOString()
                    : taskDeadline; // Fallback if milestone deadline not set

            return {
                milestone: {
                    ...m.milestone,
                    deadline: milestoneDeadline,
                    index,
                },
                assignees: m.assignees,
            };
        }),
    });
});

export const TaskAttachmentFetchSchema = z.object({
    task: TaskFetchSchema,
    tags: z.array(TaskTagFetchSchema).optional().nullable(),
    assignees: z.array(TaskAssigneeFetchSchema),
    dependencies: z.array(TaskDependencyFetchSchema).optional().nullable(),
    milestones: z.array(MilestoneFetchSchema).optional().nullable(),
    milestoneAssignees: z.array(MilestoneAssigneeFetchSchema).optional().nullable(),
});

type TaskAttachmentInputType = z.infer<typeof TaskAttachmentInsertInputSchema>;

export function normalizeFetchedAttachment(data: z.infer<typeof TaskAttachmentFetchSchema>): TaskAttachmentInputType {
    const { task, tags, assignees, dependencies, milestones, milestoneAssignees } = data;

    const normalizedMilestones = (milestones ?? []).map((milestone, index) => {
        const assigneesForMilestone = (milestoneAssignees ?? []).filter(
            (a) => a.milestone_id === milestone.id
        );

        return {
            temporary_id: milestone.id, // or keep milestone.id if reusing
            milestone: {
                ...milestone,
                deadline: milestone.deadline ? new Date(milestone.deadline) : undefined,
            },
            assignees: assigneesForMilestone.map(({ milestone_id, ...rest }) => rest),
        };
    });

    return {
        task: {
            ...task,
            deadline: task.deadline ? new Date(task.deadline) : undefined,
        },
        tags: tags ?? [],
        assignees,
        dependencies: dependencies ?? [],
        milestones: normalizedMilestones,
    };
}

// -------------------------
// TYPES
// -------------------------
export type TaskInsertInput = z.infer<typeof TaskInsertInputSchema>;
export type TaskInsert = z.infer<typeof TaskInsertSchema>;
export type TaskUpdateInput = z.infer<typeof TaskUpdateInputSchema>;
export type TaskUpdate = z.infer<typeof TaskUpdateSchema>;
export type Task = z.infer<typeof TaskFetchSchema>;

export type TaskTagInsert = z.infer<typeof TaskTagInsertSchema>;
export type TaskTagUpdate = z.infer<typeof TaskTagUpdateSchema>;
export type TaskTag = z.infer<typeof TaskTagFetchSchema>;

export type TaskAssigneeInsert = z.infer<typeof TaskAssigneeInsertSchema>;
export type TaskAssigneeUpdate = z.infer<typeof TaskAssigneeUpdateSchema>;
export type TaskAssignee = z.infer<typeof TaskAssigneeFetchSchema>;

export type TaskDependencyInsert = z.infer<typeof TaskDependencyInsertSchema>;
export type TaskDependencyUpdate = z.infer<typeof TaskDependencyUpdateSchema>;
export type TaskDependency = z.infer<typeof TaskDependencyFetchSchema>;

export type MilestoneInsertInput = z.infer<typeof MilestoneInsertInputSchema>;
export type MilestoneInsert = z.infer<typeof MilestoneInsertSchema>;
export type MilestoneUpdateInput = z.infer<typeof MilestoneUpdateInputSchema>;
export type MilestoneUpdate = z.infer<typeof MilestoneUpdateSchema>;
export type Milestone = z.infer<typeof MilestoneFetchSchema>;

export type MilestoneAssigneeInsert = z.infer<typeof MilestoneAssigneeInsertSchema>;
export type MilestoneAssigneeUpdate = z.infer<typeof MilestoneAssigneeUpdateSchema>;
export type MilestoneAssignee = z.infer<typeof MilestoneAssigneeFetchSchema>;

export type TaskAttachmentInsertInputType = z.infer<typeof TaskAttachmentInsertInputSchema>;
export type TaskAttachmentInsertType = z.infer<typeof TaskAttachmentInsertSchema>;

export type TaskAttachmentType = z.infer<typeof TaskAttachmentFetchSchema>;

export type TaskAttachmentUpdateType = Partial<{
    task: TaskUpdate,
    tags?: TaskTagUpdate[],
    assignees: TaskAssigneeUpdate[],
    dependencies?: TaskDependencyUpdate[],
    milestones?: {
        milestone: MilestoneUpdate,
        assignees: MilestoneAssigneeUpdate[],
    }[];

}>;


// export type TaskAttachmentType = {
//     task: Task,
//     tags?: TaskTag[],
//     assignees: TaskAssignee[],
//     dependencies?: TaskDependency[],
//     milestones?: {
//         milestone: Milestone,
//         assignees: MilestoneAssignee[],
//     };
// };

const SampleTaskAttachmentInsert = {
    "task": {
        "title": "Design UI Mockups",
        "description": "Create the initial UI mockups for the app.",
        "completed": false,
        "priority": "high",
        "deadline": "2025-06-01T12:00:00Z",
        "recurrence": null,
        "creator_id": "5ca622f4-f89f-4342-b7af-79909faa4a1d"
    },
    "tags": ["design", "ui", "mockups"],
    "assignees": [
        { "user_id": "ea7dc209-0d4f-4541-9f06-8bf18baf2c1b", "completed": false },
        { "user_id": "69389f9a-1cff-4ddd-84af-41d64bdebdc6", "completed": false }
    ],
    "milestones": [
        {
            "milestone": {
                "index": 0,
                "title": "Wireframes",
                "description": "Sketch basic wireframes",
                "completed": false,
                "deadline": "2025-05-15T00:00:00Z"
            },
            "assignees": [
                { "user_id": "0f2e9ca4-d8e5-4055-868b-b62d1a6e1b40", "completed": false }
            ]
        },
        {
            "milestone": {
                "index": 1,
                "title": "High-Fidelity Mockups",
                "description": "Design polished UI screens",
                "completed": false,
                "deadline": "2025-05-25T00:00:00Z"
            }
        }
    ]
};

const SampleTaskAttachment = {
    "tags": [
        {
            "id": "bbe69e26-bf2b-4d13-ad98-d8acda56fe3e",
            "tag": "design",
            "task_id": "36786f68-b449-4aec-b1d4-680704ce0af1"
        },
        {
            "id": "ca1e08a2-6a99-4ee4-a5a8-f5dcb8af4b20",
            "tag": "ui",
            "task_id": "36786f68-b449-4aec-b1d4-680704ce0af1"
        },
        {
            "id": "531573b1-fcb4-457d-ad33-958a036afd70",
            "tag": "mockups",
            "task_id": "36786f68-b449-4aec-b1d4-680704ce0af1"
        }
    ],
    "task": {
        "id": "36786f68-b449-4aec-b1d4-680704ce0af1",
        "title": "Design UI Mockups",
        "deadline": "2025-06-01T12:00:00+00:00",
        "priority": "high",
        "completed": false,
        "created_at": "2025-05-10T07:42:47.563885+00:00",
        "creator_id": "5ca622f4-f89f-4342-b7af-79909faa4a1d",
        "recurrence": null,
        "updated_at": null,
        "description": "Create the initial UI mockups for the app."
    },
    "assignees": [
        {
            "id": "71eb5e9f-f3e5-4655-8085-11209f13d978",
            "task_id": "36786f68-b449-4aec-b1d4-680704ce0af1",
            "user_id": "ea7dc209-0d4f-4541-9f06-8bf18baf2c1b",
            "completed": false
        },
        {
            "id": "5e332a24-e3ad-4286-af33-07e7353fc21e",
            "task_id": "36786f68-b449-4aec-b1d4-680704ce0af1",
            "user_id": "69389f9a-1cff-4ddd-84af-41d64bdebdc6",
            "completed": false
        }
    ],
    "milestones": [
        {
            "id": "70cea252-8211-4a0e-a7fc-05e2abc8b97c",
            "index": 0,
            "title": "Wireframes",
            "task_id": "36786f68-b449-4aec-b1d4-680704ce0af1",
            "deadline": "2025-05-15T00:00:00",
            "completed": false,
            "description": "Sketch basic wireframes"
        },
        {
            "id": "9eb3b5b9-2235-4c28-9a8c-b7e7c0d2866e",
            "index": 1,
            "title": "High-Fidelity Mockups",
            "task_id": "36786f68-b449-4aec-b1d4-680704ce0af1",
            "deadline": "2025-05-25T00:00:00",
            "completed": false,
            "description": "Design polished UI screens"
        }
    ],
    "dependencies": [],
    "milestoneAssignees": [
        {
            "id": "0af13b99-a05c-42f0-938d-6a7725020586",
            "user_id": "0f2e9ca4-d8e5-4055-868b-b62d1a6e1b40",
            "completed": false,
            "milestone_id": "70cea252-8211-4a0e-a7fc-05e2abc8b97c"
        }
    ]
}

