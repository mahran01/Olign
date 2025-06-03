import {
    MilestoneAssigneeFetchSchema,
    MilestoneAssigneeInsertSchema,
    MilestoneAssigneeUpdateSchema,
    MilestoneFetchSchema,
    MilestoneInsertSchema,
    MilestoneUpdateSchema,
    TaskAssigneeFetchSchema,
    TaskAssigneeInsertSchema,
    TaskAssigneeUpdateSchema,
    TaskAttachmentFetchSchema,
    TaskAttachmentInsertSchema,
    TaskDependencyFetchSchema,
    TaskDependencyInsertSchema,
    TaskDependencyUpdateSchema,
    TaskFetchSchema,
    TaskInsertSchema,
    TaskTagFetchSchema,
    TaskTagInsertSchema,
    TaskTagUpdateSchema,
    TaskUpdateSchema,
    UserProfilesFetchSchema,
} from '@/schemas';
import { supabase, validate, validateArray } from '@/utils';
import { z } from 'zod';

// -------------------------
// FETCH
// -------------------------
export async function fetchSingleTask(id: unknown) {
    const validated = validate(TaskFetchSchema.shape.id, id);

    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', validated);

    if (error) throw error;

    return validate(TaskFetchSchema, data);
}

export async function fetchTaskIdsAssigned(userId: unknown) {
    const validated = validate(UserProfilesFetchSchema.shape.user_id, userId);

    const { data: assigneeLinks, error: assigneeError } = await supabase
        .from('task_assignees')
        .select('task_id')
        .eq('user_id', validated);

    if (assigneeError) throw assigneeError;

    const TaskIdSchema = z.object({ task_id: TaskAssigneeFetchSchema.shape.task_id });
    const validAssigneeLinks = validateArray(TaskIdSchema, assigneeLinks || []);

    return validAssigneeLinks.map(a => a.task_id);
}

export async function fetchTasksRelatedToUser(userId: unknown) {
    const validated = validate(UserProfilesFetchSchema.shape.user_id, userId);
    const assignedTaskIds = await fetchTaskIdsAssigned(validated);

    const filters = [`creator_id.eq.${validated}`];
    if (assignedTaskIds.length > 0) {
        filters.push(`id.in.(${assignedTaskIds.join(',')})`);
    }

    const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .or(filters.join(','));

    if (tasksError) throw tasksError;

    return validateArray(TaskFetchSchema, tasks || []);
}

export async function fetchTaskRelatedRecords(taskIds: unknown[]) {
    const validated = validateArray(TaskFetchSchema.shape.id, taskIds || []);

    if (validated.length === 0) {
        return {
            taskTags: [],
            taskAssignees: [],
            taskDependencies: [],
            milestones: [],
        };
    }

    const [tagsRes, assigneesRes, depsRes, milestonesRes] = await Promise.all([
        supabase.from('task_tags').select('*').in('task_id', validated),
        supabase.from('task_assignees').select('*').in('task_id', validated),
        supabase.from('task_dependencies').select('*').in('task_id', validated),
        supabase.from('milestones').select('*').in('task_id', validated),
    ]);

    if (tagsRes.error || assigneesRes.error || depsRes.error || milestonesRes.error) {
        throw tagsRes.error || assigneesRes.error || depsRes.error || milestonesRes.error;
    }

    return {
        tags: validateArray(TaskTagFetchSchema, tagsRes.data || []),
        assignees: validateArray(TaskAssigneeFetchSchema, assigneesRes.data || []),
        dependencies: validateArray(TaskDependencyFetchSchema, depsRes.data || []),
        milestones: validateArray(MilestoneFetchSchema, milestonesRes.data || []),
    };
}

export async function fetchMilestoneAssignee(milestoneIds: unknown[]) {
    const validated = validateArray(MilestoneFetchSchema.shape.id, milestoneIds || []);

    if (validated.length === 0) {
        return [];
    }

    const { data, error } = await supabase
        .from('milestone_assignees')
        .select('*')
        .in('milestone_id', validated);

    if (error) throw error;

    return validateArray(MilestoneAssigneeFetchSchema, data || []);
}

export async function insertTaskWithRelatedData(input: unknown) {
    const validated = validate(TaskAttachmentInsertSchema, input);
    console.log('After validation before rpc');

    try {
        const { data, error } = await supabase.rpc('create_task_with_related_data', {
            task_data: validated,
        });
        if (error) throw error;
        return validate(TaskAttachmentFetchSchema, data);
    } catch (error) {
        console.error('Transaction failed:', error);
        throw error;
    }
}

// -------------------------
// TASK
// -------------------------
export async function insertTask(input: unknown) {
    const validated = validate(TaskInsertSchema, input);
    const { data, error } = await supabase.from('tasks').insert(validated).select().single();
    if (error) throw error;
    return validate(TaskFetchSchema, data);
}

export async function updateTask(id: string, input: unknown) {
    const validated = validate(TaskUpdateSchema, input);
    const { data, error } = await supabase.from('tasks').update(validated).eq('id', id).select().single();
    if (error) throw error;
    return validate(TaskFetchSchema, data);
}

export async function deleteTask(id: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
}

// -------------------------
// TASK TAG
// -------------------------
export async function insertTaskTag(input: unknown) {
    const validated = validate(TaskTagInsertSchema, input);
    const { data, error } = await supabase.from('task_tags').insert(validated).select().single();
    if (error) throw error;
    return validate(TaskTagFetchSchema, data);
}

export async function updateTaskTag(id: string, input: unknown) {
    const validated = validate(TaskTagUpdateSchema, input);
    const { data, error } = await supabase.from('task_tags').update(validated).eq('id', id).select().single();
    if (error) throw error;
    return validate(TaskTagFetchSchema, data);
}

export async function deleteTaskTag(id: string) {
    const { error } = await supabase.from('task_tags').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
}

// -------------------------
// TASK ASSIGNEES
// -------------------------
export async function insertTaskAssignee(input: unknown) {
    const validated = validate(TaskAssigneeInsertSchema, input);
    const { data, error } = await supabase.from('task_assignees').insert(validated).select().single();
    if (error) throw error;
    return validate(TaskAssigneeFetchSchema, data);
}

export async function updateTaskAssignee(id: string, input: unknown) {
    const validated = validate(TaskAssigneeUpdateSchema, input);
    const { data, error } = await supabase.from('task_assignees').update(validated).eq('id', id).select().single();
    if (error) throw error;
    return validate(TaskAssigneeFetchSchema, data);
}

export async function deleteTaskAssignee(id: string) {
    const { error } = await supabase.from('task_assignees').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
}

// -------------------------
// TASK DEPENDENCIES
// -------------------------
export async function insertTaskDependency(input: unknown) {
    const validated = validate(TaskDependencyInsertSchema, input);
    const { data, error } = await supabase.from('task_dependencies').insert(validated).select().single();
    if (error) throw error;
    return validate(TaskDependencyFetchSchema, data);
}

export async function updateTaskDependency(id: string, input: unknown) {
    const validated = validate(TaskDependencyUpdateSchema, input);
    const { data, error } = await supabase.from('task_dependencies').update(validated).eq('id', id).select().single();
    if (error) throw error;
    return validate(TaskDependencyFetchSchema, data);
}

export async function deleteTaskDependency(id: string) {
    const { error } = await supabase.from('task_dependencies').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
}

// -------------------------
// MILESTONE
// -------------------------
export async function insertMilestone(input: unknown) {
    const validated = validate(MilestoneInsertSchema, input);
    const { data, error } = await supabase.from('milestones').insert(validated).select().single();
    if (error) throw error;
    return validate(MilestoneFetchSchema, data);
}

export async function updateMilestone(id: string, input: unknown) {
    const validated = validate(MilestoneUpdateSchema, input);
    const { data, error } = await supabase.from('milestones').update(validated).eq('id', id).select().single();
    if (error) throw error;
    return validate(MilestoneFetchSchema, data);
}

export async function deleteMilestone(id: string) {
    const { error } = await supabase.from('milestones').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
}

// -------------------------
// MILESTONE ASSIGNEES
// -------------------------
export async function insertMilestoneAssignee(input: unknown) {
    const validated = validate(MilestoneAssigneeInsertSchema, input);
    const { data, error } = await supabase.from('milestone_assignees').insert(validated).select().single();
    if (error) throw error;
    return validate(MilestoneAssigneeFetchSchema, data);
}

export async function updateMilestoneAssignee(id: string, input: unknown) {
    const validated = validate(MilestoneAssigneeUpdateSchema, input);
    const { data, error } = await supabase.from('milestone_assignees').update(validated).eq('id', id).select().single();
    if (error) throw error;
    return validate(MilestoneAssigneeFetchSchema, data);
}

export async function deleteMilestoneAssignee(id: string) {
    const { error } = await supabase.from('milestone_assignees').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
}
