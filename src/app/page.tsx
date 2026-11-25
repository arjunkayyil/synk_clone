"use client";

/**
 * src/app/page.tsx
 * Dashboard page connected to real SQLite data.
 * Displays real stats and only user-created tasks in "All Workspace Tasks & Activity".
 */

import { useQuery } from "@tanstack/react-query";
import { FolderKanban, ListChecks, CheckCircle2, Clock } from "lucide-react";
import { fetchTasks, fetchProjects } from "@/lib/api";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { ActivityRow } from "@/components/dashboard/ActivityRow";
import type { Task, Project } from "@/lib/types";

export default function DashboardPage() {
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: () => fetchTasks(),
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => fetchProjects(),
  });

  const openTasks = tasks.filter(t => t.status !== "CLOSED" && t.status !== "FIXED").length;
  const completedTasks = tasks.filter(t => t.status === "FIXED" || t.status === "CLOSED").length;
  const inProgress = tasks.filter(t => t.status === "IN_PROGRESS").length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          Projects
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Welcome back. Here&apos;s what&apos;s happening in your workspace.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Projects" value={projects.length} icon={FolderKanban} color="text-blue-400" />
        <StatCard label="Open Tasks" value={openTasks} icon={ListChecks} color="text-amber-400" />
        <StatCard label="Completed Tasks" value={completedTasks} icon={CheckCircle2} color="text-green-400" />
        <StatCard label="In Progress" value={inProgress} icon={Clock} color="text-purple-400" />
      </div>

      {/* Project cards */}
      {projects.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
            PROJECTS
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map(proj => (
              <ProjectCard
                key={proj.id}
                id={proj.id}
                name={proj.name}
                projectKey={proj.key}
                totalTasks={tasks.length}
                openTasks={openTasks}
                completedTasks={completedTasks}
              />
            ))}
          </div>
        </section>
      )}

      {/* Activity list */}
      <section>
        <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
          ALL WORKSPACE TASKS &amp; ACTIVITY
        </h2>
        <div
          className="rounded-xl border overflow-hidden"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          {tasks.length === 0 ? (
            <div className="py-12 text-center text-xs" style={{ color: "var(--text-muted)" }}>
              No tasks created yet.
            </div>
          ) : (
            <>
              {/* Table header */}
              <div
                className="flex items-center gap-3 px-4 py-2 border-b text-[11px] font-semibold uppercase tracking-wider"
                style={{ borderColor: "var(--border)", color: "var(--text-muted)", backgroundColor: "var(--bg-panel)" }}
              >
                <span className="w-28">ID</span>
                <span className="w-10">Type</span>
                <span className="w-8">Pri</span>
                <span className="flex-1">Title</span>
                <span className="w-20">Status</span>
                <span className="w-20">Assignee</span>
                <span className="w-20 text-right">Updated</span>
              </div>

              {tasks.map(task => (
                <ActivityRow key={task.id} task={task} />
              ))}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
