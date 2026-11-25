"use client";

/**
 * src/app/tasks/page.tsx
 * Full task list page — mirrors Synk's project task view.
 * Shows type tabs, section tabs, search, filters, List/Board/Table/Calendar switcher,
 * and a live task table backed by the real SQLite database.
 */

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, List, Columns3, Filter, ChevronDown } from "lucide-react";
import { fetchTasks, updateTask } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { taskDisplayId, cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/lib/types";

// ── Type tabs config ──────────────────────────────────────────────────────────
const TYPE_TABS = [
  { key: "ALL",   label: "All Products & Tasks" },
  { key: "BUG",   label: "Bug" },
  { key: "TASK",  label: "Task" },
  { key: "STORY", label: "Story" },
];

const STATUS_OPTS = ["ALL", "NEW", "IN_PROGRESS", "FIXED", "CLOSED"];
const STATUS_LABEL: Record<string, string> = {
  ALL: "All statuses", NEW: "New", IN_PROGRESS: "In Progress", FIXED: "Fixed", CLOSED: "Closed",
};

const VIEW_ICONS = [
  { key: "list",  icon: List,     label: "List" },
  { key: "board", icon: Columns3, label: "Board" },
] as const;
type ViewKey = (typeof VIEW_ICONS)[number]["key"];

export default function TasksPage() {
  const qc = useQueryClient();
  const [activeType,   setActiveType]   = useState("ALL");
  const [activeStatus, setActiveStatus] = useState("ALL");
  const [search,       setSearch]       = useState("");
  const [view,         setView]         = useState<ViewKey>("list");
  const [modalOpen,    setModalOpen]    = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Fetch ALL tasks (we filter client-side so counts are always accurate)
  const { data: allTasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn:  () => fetchTasks(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      updateTask(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Per-type counts for the tab pills
  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: allTasks.length };
    for (const t of allTasks) c[t.type] = (c[t.type] ?? 0) + 1;
    return c;
  }, [allTasks]);

  // Filtered list
  const tasks = useMemo(() => {
    return allTasks.filter(t => {
      if (activeType   !== "ALL" && t.type   !== activeType)   return false;
      if (activeStatus !== "ALL" && t.status !== activeStatus) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [allTasks, activeType, activeStatus, search]);

  // Tasks shown on the Board: show user-created tasks (> 30) or any newly added tasks
  const boardTasks = useMemo(() => {
    return tasks.filter(t => t.number > 30);
  }, [tasks]);

  return (
    <div className="max-w-7xl mx-auto space-y-0">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>LB</p>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Launchbase
          </h1>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: "var(--accent)" }}
        >
          <Plus size={15} />
          New item
        </button>
      </div>

      {/* ── Type tabs ── */}
      <div
        className="rounded-xl border p-4 mb-4 space-y-3"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Products / Item types
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {tasks.length} tasks shown
          </p>
        </div>

        {/* Type pills */}
        <div className="flex flex-wrap gap-2">
          {TYPE_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveType(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
                activeType === tab.key
                  ? "bg-blue-600/20 text-blue-300 border-blue-600/50"
                  : "border-transparent text-(--text-muted) hover:text-(--text-primary) hover:border-(--border)"
              )}
            >
              {tab.key === "BUG" && <span className="text-red-400">🐛</span>}
              {tab.key === "TASK" && <span className="text-blue-400">☑</span>}
              {tab.key === "STORY" && <span className="text-purple-400">↗</span>}
              {tab.label}
              <span
                className="ml-0.5 text-[11px] px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: "var(--bg-hover)", color: "var(--text-muted)" }}
              >
                {counts[tab.key] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Section tabs */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
            Sections
          </p>
          <div className="flex gap-2">
            {["All Sections", "Bugs", "Tasks"].map(s => (
              <button
                key={s}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border transition-colors",
                  s === "All Sections"
                    ? "bg-blue-600/20 text-blue-300 border-blue-600/50"
                    : "border-(--border) text-(--text-muted) hover:text-(--text-primary)"
                )}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: s === "Bugs" ? "#ef4444" : s === "Tasks" ? "#64748b" : "#3b82f6" }}
                />
                {s}
                {s !== "All Sections" && (
                  <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>0</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Search + Views + Filters ── */}
      <div className="space-y-3 mb-2">
        {/* Search + view toggles */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div
            className="flex items-center gap-2 flex-1 max-w-xs rounded-lg px-3 py-2 text-sm"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            <Search size={14} />
            <input
              type="text"
              placeholder="Search tasks in this project…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "var(--text-primary)" }}
            />
          </div>

          <div className="flex-1" />

          {/* Views label */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
            Views
          </button>

          {/* Grouping */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
            No grouping <ChevronDown size={13} />
          </button>

          {/* View switcher */}
          <div className="flex items-center rounded-lg overflow-hidden border" style={{ borderColor: "var(--border)" }}>
            {VIEW_ICONS.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                title={label}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 text-sm transition-colors",
                  view === key
                    ? "bg-blue-600/20 text-blue-300"
                    : "text-(--text-muted) hover:text-(--text-primary)"
                )}
                style={view !== key ? { backgroundColor: "var(--bg-card)" } : {}}
              >
                <Icon size={14} />
                <span className="text-xs">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
            <Filter size={12} /> Filters:
          </span>

          {/* Status filter */}
          <select
            value={activeStatus}
            onChange={e => setActiveStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-sm border outline-none cursor-pointer"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            {STATUS_OPTS.map(s => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>

          <select
            className="px-3 py-1.5 rounded-lg text-sm border outline-none cursor-pointer"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            <option>Everyone</option>
          </select>

          <select
            className="px-3 py-1.5 rounded-lg text-sm border outline-none cursor-pointer"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            <option>All reporters</option>
          </select>

          <select
            className="px-3 py-1.5 rounded-lg text-sm border outline-none cursor-pointer"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            <option>All time</option>
          </select>
        </div>
      </div>

      {/* ── Main View (List or Board) ── */}
      {view === "board" ? (
        <div className="pt-2">
          {boardTasks.length === 0 ? (
            <div
              className="rounded-2xl border p-12 text-center space-y-3"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
            >
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                No active tasks on your board
              </p>
              <p className="text-xs max-w-sm mx-auto" style={{ color: "var(--text-muted)" }}>
                You haven&apos;t created any tasks yet. Create a new bug or task to start tracking your work here.
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-colors hover:bg-blue-600 cursor-pointer"
                style={{ backgroundColor: "var(--accent)" }}
              >
                <Plus size={14} /> Add new item
              </button>
            </div>
          ) : (
            <KanbanBoard
              tasks={boardTasks}
              onSelectTask={t => setSelectedTask(t)}
              onUpdateStatus={(id, status) => updateStatusMutation.mutate({ id, status: status as TaskStatus })}
            />
          )}
        </div>
      ) : (
        /* ── Task list ── */
        <div
          className="rounded-xl border overflow-hidden"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-20" style={{ color: "var(--text-muted)" }}>
              Loading tasks…
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3" style={{ color: "var(--text-muted)" }}>
              <p className="text-sm">No tasks found</p>
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: "var(--accent)" }}
              >
                <Plus size={14} /> Create your first item
              </button>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div
                className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center px-4 py-2 border-b text-[11px] font-semibold uppercase tracking-wider"
                style={{ borderColor: "var(--border)", color: "var(--text-muted)", backgroundColor: "var(--bg-panel)" }}
              >
                <span>Title</span>
                <span className="w-24 text-center">Status</span>
                <span className="w-28 text-center">Assignee</span>
                <span className="w-20 text-right">Updated</span>
              </div>

              {/* Rows */}
              {tasks.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onClick={() => setSelectedTask(task)}
                />
              ))}
            </>
          )}
        </div>
      )}

      {/* Create task modal */}
      <CreateTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      {/* Detail modal when a task / bug is clicked */}
      <TaskDetailModal
        task={selectedTask}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}

// ── Task row component ────────────────────────────────────────────────────────
function TaskRow({ task, onClick }: { task: Task; onClick: () => void }) {
  const displayId = taskDisplayId(task.project?.key ?? "??", task.type, task.number);

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 border-b hover:bg-(--bg-hover) transition-colors cursor-pointer"
      style={{ borderColor: "var(--border)" }}
    >
      {/* ID */}
      <span className="text-xs font-mono shrink-0 w-28" style={{ color: "var(--text-muted)" }}>
        {displayId}
      </span>

      {/* Reporter dot */}
      {task.assignee && (
        <span className="text-xs shrink-0 hidden sm:flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
          · <span style={{ color: "var(--text-secondary)" }}>{task.assignee.name.split(" ")[0]} {task.assignee.name.split(" ")[1]?.[0]}.</span>
        </span>
      )}

      {/* Type badge */}
      <Badge value={task.type} variant="type" className="shrink-0" />

      {/* Priority badge */}
      <Badge value={task.priority} variant="priority" className="shrink-0" />

      {/* Title */}
      <span className="flex-1 text-sm truncate font-medium" style={{ color: "var(--text-primary)" }}>
        {task.title}
      </span>

      {/* Status badge */}
      <div className="w-24 flex justify-center shrink-0">
        <Badge value={task.status} variant="status" />
      </div>

      {/* Assignee */}
      <div className="w-28 flex items-center gap-1.5 shrink-0 justify-end">
        {task.assignee ? (
          <>
            <Avatar name={task.assignee.name} size="sm" />
            <span className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
              {task.assignee.name.split(" ")[0]}
            </span>
          </>
        ) : (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Unassigned</span>
        )}
      </div>

      {/* Time ago */}
      <span className="text-xs shrink-0 w-24 text-right" style={{ color: "var(--text-muted)" }}>
        <TimeAgo date={task.updatedAt} />
      </span>
    </div>
  );
}
