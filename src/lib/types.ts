/** Shared TypeScript types used across the app. */

export type TaskType = "BUG" | "TASK" | "STORY";
export type TaskPriority = "P1" | "P2" | "P3";
export type TaskStatus = "NEW" | "IN_PROGRESS" | "FIXED" | "CLOSED";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
}

export interface Task {
  id: string;
  projectId: string;
  number: number;
  type: TaskType;
  priority: TaskPriority;
  title: string;
  description?: string | null;
  status: TaskStatus;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  project?: Project;
  assignee?: User | null;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  text: string;
  createdAt: string;
  user?: User;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  start: string;
  end: string | null;
}
