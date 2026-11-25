"use client";

/**
 * src/components/tasks/TaskDetailModal.tsx
 * Full task / bug detail viewer and editor matching Synk's item modal.
 * Shows status stepper, title, description, reproduction steps, expected/actual,
 * comments, evidence, and property sidebar.
 */

import { useState } from "react";
import {
  X,
  ExternalLink,
  Edit2,
  Sparkles,
  Link as LinkIcon,
  Send,
  UploadCloud,
  Check,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskDisplayId, timeAgo, cn } from "@/lib/utils";
import type { Task } from "@/lib/types";

interface Props {
  task: Task | null;
  open: boolean;
  onClose: () => void;
}

const STEPPER_STAGES = [
  { id: "NEW",         num: 1, label: "NEW" },
  { id: "ASSIGNED",    num: 2, label: "ASSIGNED" },
  { id: "IN_PROGRESS", num: 3, label: "IN PROGRESS" },
  { id: "FIXED",       num: 4, label: "FIXED" },
  { id: "TESTING",     num: 5, label: "TESTING" },
  { id: "CLOSED",      num: 6, label: "CLOSED" },
  { id: "REOPENED",    num: 7, label: "REOPENED" },
  { id: "URGENT",      num: 8, label: "URGENT" },
];

export function TaskDetailModal({ task, open, onClose }: Props) {
  const qc = useQueryClient();

  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Array<{ id: string; user: string; text: string; time: string }>>([]);
  const [currentStatus, setCurrentStatus] = useState<string>(task?.status || "NEW");

  // Sync state if task opens
  if (task && currentStatus !== task.status && !open) {
    setCurrentStatus(task.status);
  }

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      // Optimistic update local
      setCurrentStatus(newStatus);
      return newStatus;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  if (!open || !task) return null;

  const displayId = taskDisplayId(task.project?.key ?? "LB", task.type, task.number);
  const isBug = task.type === "BUG";

  function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setComments(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        user: "safnasherin979",
        text: commentText.trim(),
        time: "Just now",
      },
    ]);
    setCommentText("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className="relative z-10 w-full max-w-5xl h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{
          backgroundColor: "var(--bg-panel)",
          border: "1px solid var(--border)",
        }}
      >
        {/* ── Top Header: Breadcrumbs + Actions ── */}
        <div
          className="flex items-center justify-between px-6 py-3.5 border-b shrink-0"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2 text-xs font-medium">
            <span style={{ color: "var(--text-muted)" }}>{task.project?.name || "Lorb"}</span>
            <span style={{ color: "var(--text-muted)" }}>/</span>
            <span className="font-semibold text-blue-400">{displayId}</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1",
                isBug
                  ? "bg-red-950/50 text-red-400 border border-red-800/40"
                  : "bg-blue-950/50 text-blue-400 border border-blue-800/40"
              )}
            >
              {isBug ? "🐛 Bug" : "☑ Task"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-(--text-muted)">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
              }}
              title="Copy Link"
              className="p-1.5 rounded-lg hover:bg-(--bg-hover) hover:text-(--text-primary) transition-colors"
            >
              <ExternalLink size={15} />
            </button>
            <button
              onClick={onClose}
              title="Close"
              className="p-1.5 rounded-lg hover:bg-(--bg-hover) hover:text-(--text-primary) transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Status Stage Stepper (1 to 8) ── */}
        <div
          className="px-6 py-4 border-b overflow-x-auto shrink-0 select-none"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "rgba(14, 22, 38, 0.5)",
          }}
        >
          <div className="flex items-center justify-between min-w-[620px] gap-2">
            {STEPPER_STAGES.map(stage => {
              const active = currentStatus === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => updateStatusMutation.mutate(stage.id)}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border transition-all",
                      active
                        ? "border-blue-500 bg-blue-600/20 text-blue-400 ring-4 ring-blue-500/20 shadow-md shadow-blue-500/20"
                        : "border-(--border) text-(--text-muted) group-hover:border-blue-400/50 group-hover:text-(--text-primary)"
                    )}
                  >
                    {active ? "◎" : stage.num}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-bold tracking-wider",
                      active ? "text-blue-400" : "text-(--text-muted) group-hover:text-(--text-secondary)"
                    )}
                  >
                    {stage.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Main Modal Body: Left Content + Right Properties ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Area (Scrollable details & comments) */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-7">
            {/* Title & Action Bar */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-blue-400">{displayId}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-red-950/40 text-red-400 border border-red-800/30">
                  {isBug ? "🐛 Bug" : "Task"}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full border border-(--border) text-(--text-secondary) flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  {currentStatus}
                </span>

                <div className="flex-1" />

                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-(--border) text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-hover) transition-colors">
                  <Sparkles size={13} className="text-blue-400" />
                  Summarize
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-(--border) text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-hover) transition-colors">
                  <Edit2 size={13} />
                  Edit
                </button>
              </div>

              <h1 className="text-xl font-bold leading-snug" style={{ color: "var(--text-primary)" }}>
                {task.title}
              </h1>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-(--text-muted)">
                Description
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {task.description || "No description provided for this item."}
              </p>
            </div>

            {/* Steps to Reproduce */}
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-(--text-muted)">
                Steps to reproduce
              </h4>
              <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>
                {`1. Navigate to Live Classes and open the Upcoming & Live tab.
2. Locate an active session marked with the STARTED status badge.
3. Click the green Join button on the class card.
4. Observe the notification banner and classroom behavior.`}
              </div>
            </div>

            {/* Expected Result */}
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-(--text-muted)">
                Expected result
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Clicking Join on a STARTED session connects the user and opens the interactive live classroom room without errors.
              </p>
            </div>

            {/* Actual Result */}
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-(--text-muted)">
                Actual result
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                The session does not open, and a red toast notification appears in the top-right corner reading: &quot;Failed to join live class. Please try again.&quot;
              </p>
            </div>

            {/* Evidence / Attachments */}
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-(--text-muted)">
                Evidence
              </h4>
              <div className="flex flex-wrap gap-3">
                <div
                  className="rounded-xl border p-2 flex flex-col gap-1.5 w-44 hover:border-blue-500/50 transition-colors cursor-pointer group"
                  style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
                >
                  <div className="h-24 w-full rounded-lg bg-slate-800/80 flex items-center justify-center overflow-hidden border border-(--border)">
                    <div className="text-[10px] text-(--text-muted) flex items-center gap-1">
                      <span>🖼️</span> Preview
                    </div>
                  </div>
                  <span className="text-xs truncate font-medium text-(--text-secondary) group-hover:text-blue-400">
                    Bug4.jpeg
                  </span>
                </div>
              </div>

              <div
                className="w-full rounded-xl border border-dashed py-4 px-4 flex items-center justify-center gap-2 cursor-pointer transition-colors hover:border-blue-500/50 hover:bg-(--bg-hover)"
                style={{ borderColor: "var(--border)", backgroundColor: "rgba(14, 22, 38, 0.3)" }}
              >
                <UploadCloud size={15} className="text-blue-400" />
                <span className="text-xs text-(--text-secondary)">Drop files or click to attach</span>
              </div>
            </div>

            {/* Linked Issues */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-(--text-muted)">
                Linked issues
              </h4>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-(--border) text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-hover) transition-colors">
                <LinkIcon size={12} />
                <span>Link issue</span>
              </button>
            </div>

            {/* Comments Section */}
            <div className="space-y-3 pt-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-(--text-muted)">
                Comments
              </h4>

              {comments.length === 0 ? (
                <p className="text-xs text-(--text-muted)">No comments yet.</p>
              ) : (
                <div className="space-y-3">
                  {comments.map(c => (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-xl border space-y-1.5"
                      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-blue-400">{c.user}</span>
                        <span className="text-[11px] text-(--text-muted)">{c.time}</span>
                      </div>
                      <p className="text-sm" style={{ color: "var(--text-primary)" }}>{c.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment input */}
              <form onSubmit={handleAddComment} className="space-y-2 pt-1">
                <div
                  className="rounded-xl border overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/50"
                  style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
                >
                  <textarea
                    rows={3}
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Add a comment... (markdown supported)"
                    className="w-full p-3.5 bg-transparent outline-none text-sm resize-none"
                    style={{ color: "var(--text-primary)" }}
                  />
                  <div
                    className="flex justify-end p-2 border-t"
                    style={{ borderColor: "var(--border)", backgroundColor: "rgba(14, 22, 38, 0.4)" }}
                  >
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-40 cursor-pointer hover:bg-blue-600"
                      style={{ backgroundColor: "var(--accent)" }}
                    >
                      <Send size={12} />
                      Comment
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Timeline */}
            <div className="space-y-2 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-(--text-muted)">
                Timeline
              </h4>
              <div className="flex items-center gap-2 text-xs text-(--text-muted)">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="font-semibold text-(--text-secondary)">safnasherin979</span> created the item
                <span>·</span>
                <span>{timeAgo(task.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Right Properties Sidebar */}
          <div
            className="w-72 shrink-0 border-l overflow-y-auto p-5 space-y-4"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "rgba(14, 22, 38, 0.5)",
            }}
          >
            <PropItem label="ASSIGNEE">
              <select
                defaultValue={task.assigneeId || ""}
                className="w-full px-3 py-2 rounded-xl text-xs border outline-none cursor-pointer"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              >
                <option value="">{task.assignee?.name || "Unassigned"}</option>
              </select>
            </PropItem>

            <PropItem label="SECTION">
              <select
                defaultValue="No section"
                className="w-full px-3 py-2 rounded-xl text-xs border outline-none cursor-pointer"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              >
                <option>No section</option>
                <option>Frontend</option>
                <option>Backend</option>
              </select>
            </PropItem>

            <PropItem label="REPORTER">
              <div
                className="w-full px-3 py-2 rounded-xl text-xs border truncate font-medium"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              >
                safnasherin979
              </div>
            </PropItem>

            <PropItem label="DUE DATE">
              <div
                className="w-full px-3 py-2 rounded-xl text-xs border"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-muted)" }}
              >
                —
              </div>
            </PropItem>

            <PropItem label="PRIORITY">
              <select
                defaultValue={task.priority}
                className="w-full px-3 py-2 rounded-xl text-xs border outline-none cursor-pointer font-medium"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              >
                <option value="P1">P1</option>
                <option value="P2">P2</option>
                <option value="P3">P3</option>
              </select>
            </PropItem>

            <PropItem label="PRODUCTION">
              <select
                defaultValue="Pending deployment"
                className="w-full px-3 py-2 rounded-xl text-xs border outline-none cursor-pointer"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              >
                <option>Pending deployment</option>
                <option>Deployed</option>
              </select>
            </PropItem>

            <PropItem label="SEVERITY">
              <div
                className="w-full px-3 py-2 rounded-xl text-xs border font-medium text-red-400"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
              >
                Critical
              </div>
            </PropItem>

            <PropItem label="MODULE">
              <div
                className="w-full px-3 py-2 rounded-xl text-xs border font-medium"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              >
                Live Classes / LORB Meet
              </div>
            </PropItem>

            <PropItem label="ENVIRONMENT">
              <div
                className="w-full px-3 py-2 rounded-xl text-xs border text-(--text-muted)"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
              >
                —
              </div>
            </PropItem>

            <PropItem label="VERSION">
              <div
                className="w-full px-3 py-2 rounded-xl text-xs border text-(--text-muted)"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
              >
                —
              </div>
            </PropItem>

            <PropItem label="BROWSER">
              <div
                className="w-full px-3 py-2 rounded-xl text-xs border text-(--text-muted)"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
              >
                —
              </div>
            </PropItem>

            <PropItem label="OPERATING SYSTEM">
              <div
                className="w-full px-3 py-2 rounded-xl text-xs border text-(--text-muted)"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
              >
                —
              </div>
            </PropItem>

            <PropItem label="FREQUENCY">
              <div
                className="w-full px-3 py-2 rounded-xl text-xs border text-(--text-muted)"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
              >
                —
              </div>
            </PropItem>

            <PropItem label="CREATED">
              <div
                className="w-full px-3 py-2 rounded-xl text-xs border text-(--text-secondary)"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
              >
                {timeAgo(task.createdAt)}
              </div>
            </PropItem>
          </div>
        </div>
      </div>
    </div>
  );
}

function PropItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-[10px] font-bold uppercase tracking-wider text-(--text-muted)">
        {label}
      </label>
      {children}
    </div>
  );
}
