/**
 * src/lib/api.ts
 * Thin fetch wrappers used by TanStack Query hooks.
 */

import type { Task, Project, User } from "./types";

// ── Tasks ─────────────────────────────────────────────────────────────────────
export async function fetchTasks(params?: {
  projectId?: string;
  status?: string;
  type?: string;
  q?: string;
}): Promise<Task[]> {
  const url = new URL("/api/tasks", window.location.origin);
  if (params?.projectId) url.searchParams.set("projectId", params.projectId);
  if (params?.status)    url.searchParams.set("status",    params.status);
  if (params?.type)      url.searchParams.set("type",      params.type);
  if (params?.q)         url.searchParams.set("q",         params.q);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json() as Promise<Task[]>;
}

export async function createTask(data: {
  projectId:    string;
  type:         string;
  priority:     string;
  title:        string;
  description?: string;
  status?:      string;
  assigneeId?:  string | null;
}): Promise<Task> {
  const res = await fetch("/api/tasks", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json() as Promise<Task>;
}

// ── Projects ──────────────────────────────────────────────────────────────────
export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json() as Promise<Project[]>;
}

// ── Users ─────────────────────────────────────────────────────────────────────
export async function fetchUsers(): Promise<User[]> {
  const res = await fetch("/api/users");
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json() as Promise<User[]>;
}
