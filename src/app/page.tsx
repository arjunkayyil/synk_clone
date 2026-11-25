/**
 * src/app/page.tsx
 * Dashboard page — shows stat cards, project cards, and recent activity.
 * Currently uses hardcoded data; will be replaced with real DB data after Prisma is wired up.
 */
import { FolderKanban, ListChecks, CheckCircle2, Clock } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { ActivityRow } from "@/components/dashboard/ActivityRow";
import type { Task } from "@/lib/types";

// ── Hardcoded data (Step 1) ───────────────────────────────────────────────────
const USERS = {
  alice: { id: "u1", name: "Alice Chen",  email: "alice@synk.dev" },
  bob:   { id: "u2", name: "Bob Ray",     email: "bob@synk.dev" },
  carol: { id: "u3", name: "Carol Singh", email: "carol@synk.dev" },
};

const PROJECT = { id: "p1", name: "Launchbase", key: "LB" };

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const SAMPLE_TASKS: Task[] = [
  { id: "t1",  projectId: "p1", number: 7,  type: "STORY", priority: "P1", title: "Implement drag-and-drop board",      status: "IN_PROGRESS", assigneeId: "u1", createdAt: daysAgo(10), updatedAt: daysAgo(10), project: PROJECT, assignee: USERS.alice },
  { id: "t2",  projectId: "p1", number: 8,  type: "BUG",   priority: "P1", title: "Timer resets on page refresh",       status: "NEW",         assigneeId: "u3", createdAt: daysAgo(9),  updatedAt: daysAgo(9),  project: PROJECT, assignee: USERS.carol },
  { id: "t3",  projectId: "p1", number: 2,  type: "BUG",   priority: "P1", title: "Login page crashes on mobile",       status: "FIXED",       assigneeId: "u2", createdAt: daysAgo(18), updatedAt: daysAgo(18), project: PROJECT, assignee: USERS.bob   },
  { id: "t4",  projectId: "p1", number: 12, type: "TASK",  priority: "P1", title: "Database query optimisation",        status: "IN_PROGRESS", assigneeId: "u3", createdAt: daysAgo(7),  updatedAt: daysAgo(7),  project: PROJECT, assignee: USERS.carol },
  { id: "t5",  projectId: "p1", number: 5,  type: "BUG",   priority: "P2", title: "Dashboard flickers on load",         status: "IN_PROGRESS", assigneeId: "u2", createdAt: daysAgo(12), updatedAt: daysAgo(12), project: PROJECT, assignee: USERS.bob   },
  { id: "t6",  projectId: "p1", number: 3,  type: "STORY", priority: "P2", title: "User onboarding flow",               status: "IN_PROGRESS", assigneeId: "u3", createdAt: daysAgo(15), updatedAt: daysAgo(15), project: PROJECT, assignee: USERS.carol },
  { id: "t7",  projectId: "p1", number: 19, type: "BUG",   priority: "P2", title: "Search returns stale results",       status: "NEW",         assigneeId: "u1", createdAt: daysAgo(4),  updatedAt: daysAgo(4),  project: PROJECT, assignee: USERS.alice },
  { id: "t8",  projectId: "p1", number: 24, type: "BUG",   priority: "P1", title: "Board drag leaves ghost card",       status: "IN_PROGRESS", assigneeId: "u3", createdAt: daysAgo(2),  updatedAt: daysAgo(2),  project: PROJECT, assignee: USERS.carol },
  { id: "t9",  projectId: "p1", number: 6,  type: "TASK",  priority: "P3", title: "Write API documentation",            status: "NEW",         assigneeId: null, createdAt: daysAgo(11), updatedAt: daysAgo(11), project: PROJECT, assignee: null        },
  { id: "t10", projectId: "p1", number: 10, type: "STORY", priority: "P3", title: "Notification system",                status: "NEW",         assigneeId: null, createdAt: daysAgo(8),  updatedAt: daysAgo(8),  project: PROJECT, assignee: null        },
];

const STATS = {
  totalProjects:   1,
  openTasks:       SAMPLE_TASKS.filter((t) => t.status !== "CLOSED" && t.status !== "FIXED").length,
  completedTasks:  SAMPLE_TASKS.filter((t) => t.status === "FIXED" || t.status === "CLOSED").length,
  inProgress:      SAMPLE_TASKS.filter((t) => t.status === "IN_PROGRESS").length,
};

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          Projects
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Welcome back, Alice. Here&apos;s what&apos;s happening.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Projects"   value={STATS.totalProjects}  icon={FolderKanban} color="text-blue-400" />
        <StatCard label="Open Tasks"       value={STATS.openTasks}      icon={ListChecks}   color="text-amber-400" />
        <StatCard label="Completed Tasks"  value={STATS.completedTasks} icon={CheckCircle2} color="text-green-400" />
        <StatCard label="In Progress"      value={STATS.inProgress}     icon={Clock}        color="text-purple-400" />
      </div>

      {/* Project cards */}
      <section>
        <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
          PROJECTS
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ProjectCard
            id={PROJECT.id}
            name={PROJECT.name}
            projectKey={PROJECT.key}
            totalTasks={SAMPLE_TASKS.length}
            openTasks={STATS.openTasks}
            completedTasks={STATS.completedTasks}
          />
        </div>
      </section>

      {/* Activity list */}
      <section>
        <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
          ALL WORKSPACE TASKS &amp; ACTIVITY
        </h2>
        <div
          className="rounded-xl border overflow-hidden"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          {/* Table header */}
          <div
            className="flex items-center gap-3 px-4 py-2 border-b text-[11px] font-semibold uppercase tracking-wider"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            <span className="w-28">ID</span>
            <span className="w-10">Type</span>
            <span className="w-8">Pri</span>
            <span className="flex-1">Title</span>
            <span className="w-20">Status</span>
            <span className="w-20">Assignee</span>
            <span className="w-20 text-right">Updated</span>
          </div>

          {SAMPLE_TASKS.map((task) => (
            <ActivityRow key={task.id} task={task} />
          ))}
        </div>
      </section>
    </div>
  );
}
