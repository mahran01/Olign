type Task = {
    id: string; // Unique identifier for the task
    createdAt: string; // Creation timestamp in ISO 8601 format
    updatedAt?: string; // Last update timestamp in ISO 8601 format
    priority?: "low" | "medium" | "high"; // Task priority level
    tags?: string[]; // List of tags or categories for the task
    milestones?: MileStone[]; // Nested subtasks for more complex tasks
    dependencies?: string[]; // List of task IDs this task depends on
    attachments?: string[]; // URLs or references to related attachments/files
    recurrence?: Recurrence; // Recurrence rules for repeating tasks
} & MileStone;

type MileStone = {
    title: string; // Brief name of the milestone
    description?: string; // Detailed description
    completed: boolean; // Status of completion
    dueDate?: string; // Due date in ISO 8601 format
    assignees: Assignees[]; // Array of assigned people with specific details
};

type Assignees = {
    userId: string; // Unique ID of the assignee
    role: "milestone" | "general"; // Role type: "milestone" or "general"
    completed: boolean; // Status of completion
};

type Recurrence = {
    frequency: "daily" | "weekly" | "monthly" | "yearly"; // Frequency of repetition
    interval?: number; // Interval between occurrences (e.g., every 2 days)
    daysOfWeek?: number[]; // Days of the week (0 for Sunday, 6 for Saturday)
    dayOfMonth?: number; // Specific day of the month (e.g., 15th)
    monthOfYear?: number; // Specific month of the year (1 for January, 12 for December)
    endDate?: string; // Date to stop recurrence (ISO 8601 format)
};

export type TaskAttachmentType = {
    type: "task",
} & Task;