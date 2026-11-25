"use client";

/**
 * src/app/tasks/page.tsx
 * Full task workspace page — mirrors Synk's workspace and project view.
 * Features:
 * - Header: "All Workspace Tasks & Activity" + "All Tasks" / "LB Lorb" pills + "+ New item"
 * - Types: "All Products & Tasks", "Bug", "Task", "Story"
 * - Search & View Switcher (List, Board, Table, Calendar)
 * - Dynamic Filters:
 *   - "All Projects"
 *   - "All statuses"
 *   - "Everyone" dropdown (Pic 8): Everyone, Assigned to me, Unassigned, Abhinav K, Adhil Roshan, Admin, Anooja C K, Arathi V, arjunkayyil, Fathima Manal, Krishna M R, nibinkuzhikkattil, nihal, Niyas M T, etc.
 *   - REMOVED: "All reporters" (Pic 5)
 *   - "All time" dropdown (Pic 2): All time, Today, Last 7 days, Last 30 days
 */

import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  Plus,
  Search,
  List as ListIcon,
  Columns3,
  Filter,
  ChevronDown,
  Check,
  User as UserIcon,
} from "lucide-react";
import { fetchTasks, fetchUsers, updateTask } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { taskDisplayId, cn } from "@/lib/utils";
import type { Task, TaskStatus, User } from "@/lib/types";

// ── Type tabs config ──────────────────────────────────────────────────────────
const TYPE_TABS = [
  { key: "ALL",   label: "All Products & Tasks" },
  { key: "BUG",   label: "Bug" },
  { key: "TASK",  label: "Task" },
  { key: "STORY", label: "Story" },
];

const STATUS_OPTS = ["ALL", "NEW", "IN_PROGRESS", "FIXED", "CLOSED"];
const STATUS_LABEL: Record<string, string> = {
  ALL: "All statuses",
  NEW: "New",
  IN_PROGRESS: "In Progress",
  FIXED: "Fixed",
  CLOSED: "Closed",
};

const TIME_OPTS = [
  { key: "ALL",          label: "All time" },
  { key: "TODAY",        label: "Today" },
  { key: "LAST_7_DAYS",  label: "Last 7 days" },
  { key: "LAST_30_DAYS", label: "Last 30 days" },
];

const VIEW_ICONS = [
  { key: "list",  icon: ListIcon, label: "List" },
  { key: "board", icon: Columns3, label: "Board" },
] as const;
type ViewKey = (typeof VIEW_ICONS)[number]["key"];

export default function TasksPage() {
  const qc = useQueryClient();
  const { data: session } = useSession();

  // Tab & Filter states
  const [projectFilter,  setProjectFilter]  = useState("ALL"); // "ALL" | "LB"
  const [activeType,     setActiveType]     = useState("ALL");
  const [activeStatus,   setActiveStatus]   = useState("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState("ALL"); // "ALL" | "ME" | "UNASSIGNED" | user.name | user.id
  const [timeFilter,     setTimeFilter]     = useState("ALL");
  const [search,         setSearch]         = useState("");
  const [view,           setView]           = useState<ViewKey>("board");
  const [modalOpen,      setModalOpen]      = useState(false);
  const [selectedTask,   setSelectedTask]   = useState<Task | null>(null);

  // Popover open states
  const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);
  const [isTimeOpen,     setIsTimeOpen]     = useState(false);

  const assigneeRef = useRef<HTMLDivElement>(null);
  const timeRef     = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (assigneeRef.current && !assigneeRef.current.contains(e.target as Node)) {
        setIsAssigneeOpen(false);
      }
      if (timeRef.current && !timeRef.current.contains(e.target as Node)) {
        setIsTimeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch tasks
  const { data: allTasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: () => fetchTasks(),
  });

  // Fetch team members
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => fetchUsers(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      updateTask(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Per-type counts
  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: allTasks.length };
    for (const t of allTasks) c[t.type] = (c[t.type] ?? 0) + 1;
    return c;
  }, [allTasks]);

  // Current user's email/name for "Assigned to me"
  const currentEmail = session?.user?.email?.toLowerCase() || "arjunkayyil@gmail.com";
  const currentName  = session?.user?.name?.toLowerCase() || "arjun";

  // Filtered tasks
  const tasks = useMemo(() => {
    return allTasks.filter(t => {
      // Project
      if (projectFilter !== "ALL" && t.project?.key !== projectFilter && t.projectId !== projectFilter) {
        return false;
      }

      // Type
      if (activeType !== "ALL" && t.type !== activeType) return false;

      // Status
      if (activeStatus !== "ALL" && t.status !== activeStatus) return false;

      // Search
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;

      // Assignee
      if (assigneeFilter === "UNASSIGNED") {
        if (t.assigneeId) return false;
      } else if (assigneeFilter === "ME") {
        const isMe =
          (t.assignee?.email && t.assignee.email.toLowerCase() === currentEmail) ||
          (t.assignee?.name && t.assignee.name.toLowerCase().includes(currentName));
        if (!isMe) return false;
      } else if (assigneeFilter !== "ALL") {
        if (t.assigneeId !== assigneeFilter && t.assignee?.name !== assigneeFilter) return false;
      }

      // Time
      if (timeFilter !== "ALL") {
        const taskTime = new Date(t.createdAt).getTime();
        const now = Date.now();
        if (timeFilter === "TODAY") {
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);
          if (taskTime < startOfToday.getTime()) return false;
        } else if (timeFilter === "LAST_7_DAYS") {
          const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
          if (taskTime < sevenDaysAgo) return false;
        } else if (timeFilter === "LAST_30_DAYS") {
          const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
          if (taskTime < thirtyDaysAgo) return false;
        }
      }

      return true;
    });
  }, [allTasks, activeType, activeStatus, search, assigneeFilter, timeFilter, currentEmail, currentName]);

  // Label for the assignee filter button
  const currentAssigneeLabel = useMemo(() => {
    if (assigneeFilter === "ALL") return "Everyone";
    if (assigneeFilter === "ME") return "Assigned to me";
    if (assigneeFilter === "UNASSIGNED") return "Unassigned";
    const foundUser = users.find(u => u.id === assigneeFilter || u.name === assigneeFilter);
    return foundUser ? foundUser.name : assigneeFilter;
  }, [assigneeFilter, users]);

  // Label for time filter button
  const currentTimeLabel = useMemo(() => {
    const opt = TIME_OPTS.find(o => o.key === timeFilter);
    return opt ? opt.label : "All time";
  }, [timeFilter]);

  return (
    <div className="max-w-7xl mx-auto space-y-0 pb-12">
      {/* ── Page header (matches Synk Image 2) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            All Workspace Tasks & Activity
          </h1>
        </div>

        {/* Right + New item button */}
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow-sm hover:brightness-110 cursor-pointer"
          style={{ backgroundColor: "var(--accent)" }}
        >
          <Plus size={15} />
          New item
        </button>
      </div>

      {/* ── Type tabs ── */}
      <div
        className="rounded-2xl border p-4 mb-4 space-y-3"
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
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors border",
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
      </div>

      {/* ── Search + Views + Filters ── */}
      <div className="space-y-3 mb-4">
        {/* Search + view toggles */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div
            className="flex items-center gap-2 flex-1 max-w-sm rounded-xl px-3 py-2 text-sm"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            <Search size={14} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "var(--text-primary)" }}
            />
          </div>

          <div className="flex-1" />

          {/* View switcher (List, Board, Table, Calendar) */}
          <div className="flex items-center rounded-xl overflow-hidden border p-0.5 gap-0.5" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            {VIEW_ICONS.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                title={label}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  view === key
                    ? "bg-blue-600/25 text-blue-300 border border-blue-500/30"
                    : "text-(--text-muted) hover:text-(--text-primary) border border-transparent"
                )}
              >
                <Icon size={13} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            <Filter size={12} /> Filters:
          </span>

          {/* All Projects dropdown */}
          <select
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium border outline-none cursor-pointer"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            <option value="ALL">All Projects</option>
            <option value="LB">Lorb</option>
          </select>

          {/* Status filter */}
          <select
            value={activeStatus}
            onChange={e => setActiveStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium border outline-none cursor-pointer"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            {STATUS_OPTS.map(s => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>

          {/* ── Assignee ("Everyone") Popover Dropdown (Matches Synk Pic 8) ── */}
          <div className="relative" ref={assigneeRef}>
            <button
              type="button"
              onClick={() => {
                setIsAssigneeOpen(!isAssigneeOpen);
                setIsTimeOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors hover:border-blue-500/50 cursor-pointer"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: isAssigneeOpen ? "var(--accent)" : "var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              <span>{currentAssigneeLabel}</span>
              <ChevronDown size={12} className="opacity-70" />
            </button>

            {/* Custom Popover Menu matching Pic 8 */}
            {isAssigneeOpen && (
              <div
                className="absolute left-0 mt-1.5 w-56 rounded-2xl border shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 bg-white dark:bg-[#0d131f] border-slate-200 dark:border-[#1e293b]"
              >
                {/* Everyone */}
                <button
                  type="button"
                  onClick={() => {
                    setAssigneeFilter("ALL");
                    setIsAssigneeOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors hover:bg-slate-100 dark:hover:bg-[#1e293b]/70 cursor-pointer",
                    assigneeFilter === "ALL"
                      ? "text-blue-600 dark:text-blue-400 font-medium"
                      : "text-slate-800 dark:text-[#f1f5f9]"
                  )}
                >
                  <span className="font-medium">Everyone</span>
                  {assigneeFilter === "ALL" && <Check size={14} className="text-blue-600 dark:text-blue-400" />}
                </button>

                {/* Assigned to me */}
                <button
                  type="button"
                  onClick={() => {
                    setAssigneeFilter("ME");
                    setIsAssigneeOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors hover:bg-slate-100 dark:hover:bg-[#1e293b]/70 cursor-pointer",
                    assigneeFilter === "ME"
                      ? "text-blue-600 dark:text-blue-400 font-medium"
                      : "text-slate-800 dark:text-[#f1f5f9]"
                  )}
                >
                  <span>Assigned to me</span>
                  {assigneeFilter === "ME" && <Check size={14} className="text-blue-600 dark:text-blue-400" />}
                </button>

                {/* Unassigned */}
                <button
                  type="button"
                  onClick={() => {
                    setAssigneeFilter("UNASSIGNED");
                    setIsAssigneeOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors hover:bg-slate-100 dark:hover:bg-[#1e293b]/70 cursor-pointer",
                    assigneeFilter === "UNASSIGNED"
                      ? "text-blue-600 dark:text-blue-400 font-medium"
                      : "text-slate-800 dark:text-[#f1f5f9]"
                  )}
                >
                  <span>Unassigned</span>
                  {assigneeFilter === "UNASSIGNED" && <Check size={14} className="text-blue-600 dark:text-blue-400" />}
                </button>

                <div className="my-1 border-t border-slate-200 dark:border-[#1e293b]" />

                {/* Team Members List (Pic 8 order) */}
                <div className="max-h-64 overflow-y-auto space-y-0.5">
                  {users.map(u => {
                    const isSelected = assigneeFilter === u.name || assigneeFilter === u.id;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setAssigneeFilter(u.name);
                          setIsAssigneeOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-left transition-colors hover:bg-slate-100 dark:hover:bg-[#1e293b]/70 cursor-pointer",
                          isSelected
                            ? "text-blue-600 dark:text-blue-400 font-medium"
                            : "text-slate-700 dark:text-[#cbd5e1]"
                        )}
                      >
                        <span className="truncate">{u.name}</span>
                        {isSelected && <Check size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* NOTE: "All reporters" button has been completely removed as requested */}

          {/* ── Time ("All time") Popover Dropdown (Matches Synk Pic 2) ── */}
          <div className="relative" ref={timeRef}>
            <button
              type="button"
              onClick={() => {
                setIsTimeOpen(!isTimeOpen);
                setIsAssigneeOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors hover:border-blue-500/50 cursor-pointer"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: isTimeOpen ? "var(--accent)" : "var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              <span>{currentTimeLabel}</span>
              <ChevronDown size={12} className="opacity-70" />
            </button>

            {/* Custom Popover Menu matching Pic 2 */}
            {isTimeOpen && (
              <div
                className="absolute left-0 mt-1.5 w-44 rounded-2xl border shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 bg-white dark:bg-[#0d131f] border-slate-200 dark:border-[#1e293b]"
              >
                {TIME_OPTS.map(opt => {
                  const isSelected = timeFilter === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        setTimeFilter(opt.key);
                        setIsTimeOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors hover:bg-slate-100 dark:hover:bg-[#1e293b]/70 cursor-pointer",
                        isSelected
                          ? "text-blue-600 dark:text-blue-400 font-medium"
                          : "text-slate-800 dark:text-[#f1f5f9]"
                      )}
                    >
                      <span className="font-medium">{opt.label}</span>
                      {isSelected && <Check size={14} className="text-blue-600 dark:text-blue-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main View (Board, List, Table, Calendar) ── */}
      {view === "board" ? (
        <div className="pt-2">
          {tasks.length === 0 ? (
            <div
              className="rounded-2xl border p-12 text-center space-y-3"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
            >
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                No active tasks found
              </p>
              <p className="text-xs max-w-sm mx-auto" style={{ color: "var(--text-muted)" }}>
                No tasks match your selected filters. Try changing or clearing the filters above.
              </p>
              <button
                onClick={() => {
                  setActiveType("ALL");
                  setActiveStatus("ALL");
                  setAssigneeFilter("ALL");
                  setTimeFilter("ALL");
                  setSearch("");
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-colors hover:bg-blue-600 cursor-pointer"
                style={{ backgroundColor: "var(--accent)" }}
              >
                Reset filters
              </button>
            </div>
          ) : (
            <KanbanBoard
              tasks={tasks}
              onSelectTask={t => setSelectedTask(t)}
              onUpdateStatus={(id, status) => updateStatusMutation.mutate({ id, status: status as TaskStatus })}
            />
          )}
        </div>
      ) : (
        /* ── Task list / table ── */
        <div
          className="rounded-2xl border overflow-hidden shadow-sm"
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
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer"
                style={{ backgroundColor: "var(--accent)" }}
              >
                <Plus size={14} /> Create your first item
              </button>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div
                className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center px-4 py-2.5 border-b text-[11px] font-semibold uppercase tracking-wider"
                style={{ borderColor: "var(--border)", color: "var(--text-muted)", backgroundColor: "var(--bg-panel)" }}
              >
                <span>Title</span>
                <span className="w-24 text-center">Status</span>
                <span className="w-32 text-center">Assignee</span>
                <span className="w-24 text-right">Updated</span>
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
  const displayId = taskDisplayId(task.project?.key ?? "LB", task.type, task.number);

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 border-b hover:bg-(--bg-hover) transition-colors cursor-pointer"
      style={{ borderColor: "var(--border)" }}
    >
      {/* ID */}
      <span className="text-xs font-mono shrink-0 w-28 text-slate-400">
        {displayId}
      </span>

      {/* Type badge */}
      <Badge value={task.type} variant="type" className="shrink-0 text-[10px]" />

      {/* Priority badge */}
      <Badge value={task.priority} variant="priority" className="shrink-0 text-[10px]" />

      {/* Title */}
      <span className="flex-1 text-sm truncate font-medium text-slate-100">
        {task.title}
      </span>

      {/* Status badge */}
      <div className="w-24 flex justify-center shrink-0">
        <Badge value={task.status} variant="status" />
      </div>

      {/* Assignee */}
      <div className="w-32 flex items-center gap-1.5 shrink-0 justify-end">
        {task.assignee ? (
          <>
            <Avatar name={task.assignee.name} size="sm" />
            <span className="text-xs truncate text-slate-300">
              {task.assignee.name}
            </span>
          </>
        ) : (
          <span className="text-xs text-slate-500">Unassigned</span>
        )}
      </div>

      {/* Time ago */}
      <span className="text-xs shrink-0 w-24 text-right text-slate-400">
        <TimeAgo date={task.updatedAt} />
      </span>
    </div>
  );
}
