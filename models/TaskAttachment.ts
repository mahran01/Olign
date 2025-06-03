type AtLeastOne<T> = [T, ...T[]];

export type Task = {
    id: string; // Unique identifier for the task
    created_at: string; // Creation timestamp in ISO 8601 format
    updated_at?: string; // Last update timestamp in ISO 8601 format
    priority?: "low" | "medium" | "high"; // Task priority level
    tag?: string | AtLeastOne<string>; // List of tags or categories for the task
    milestone: Milestone | AtLeastOne<Milestone>; // Nested subtasks for more complex tasks
    dependency?: string | AtLeastOne<string>; // List of task IDs this task depends on
    attachment?: string | AtLeastOne<string>; // URLs or references to related attachments/files
    recurrence?: Recurrence; // Recurrence rules for repeating tasks
} & Milestone;


export type Milestone = {
    title: string; // Brief name of the milestone
    description?: string; // Detailed description
    completed: boolean; // Status of completion
    deadline?: string; // Due date in ISO 8601 format
    assignee?: Assignee | AtLeastOne<Assignee>; // Array of assigned people with specific details
};

export type Assignee = {
    user_id: string; // Unique ID of the assignee
    completed: boolean; // Status of completion
};

export type Recurrence = {
    frequency?: "daily" | "weekly" | "monthly" | "yearly"; // Frequency of repetition
    interval?: number; // Interval between occurrences (e.g., every 2 days)
    days_of_week?: number | AtLeastOne<number>; // Days of the week (0 for Sunday, 6 for Saturday)
    days_of_month?: number | AtLeastOne<number>; // Specific day of the month (e.g., 15th)
    months_of_year?: number | AtLeastOne<number>; // Specific month of the year (1 for January, 12 for December)
    end_date?: string; // Date to stop recurrence (ISO 8601 format)
};

export type TaskAttachmentType = {
    type: "task",
    task: Task;
};

export type TaskSendType = {
    title: string; // Brief name of the milestone
    description?: string; // Detailed description
    deadline?: Date; // Due date in ISO 8601 format
    assigneeId: string; // Array of assigned people with specific details
};