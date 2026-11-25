"use client";

/**
 * src/components/tasks/CreateTaskModal.tsx
 * Full-screen modal to create a Bug or Task — mirrors the Synk "New Bug/Task" UI.
 * Left pane: form fields. Right pane: properties (status, priority, assignee).
 */

import { useState, useEffect } from "react";
import { X, Bug, ClipboardList } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProjects, fetchUsers, createTask } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Project, User } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  /** If provided, pre-selects the project */
  defaultProjectId?: string;
}

type TaskType = "BUG" | "TASK";

const STATUSES   = ["NEW", "IN_PROGRESS", "FIXED", "CLOSED"];
const PRIORITIES = ["P1", "P2", "P3"];
const SEVERITIES = ["Critical", "High", "Medium", "Low"];
const ENVS       = ["Production", "Staging", "Development", "Local"];

const statusLabel: Record<string, string> = {
  NEW: "New", IN_PROGRESS: "In Progress", FIXED: "Fixed", CLOSED: "Closed",
};

export function CreateTaskModal({ open, onClose, defaultProjectId }: Props) {
  const qc = useQueryClient();

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    enabled: open,
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
    enabled: open,
  });

  // ── Form state ──────────────────────────────────────────────────────────────
  const [type,        setType]        = useState<TaskType>("BUG");
  const [projectId,   setProjectId]   = useState(defaultProjectId ?? "");
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [severity,    setSeverity]    = useState("");
  const [steps,       setSteps]       = useState("");
  const [expected,    setExpected]    = useState("");
  const [actual,      setActual]      = useState("");
  const [module,      setModule]      = useState("");
  const [environment, setEnvironment] = useState("");
  const [version,     setVersion]     = useState("");
  const [browser,     setBrowser]     = useState("");

  // Properties
  const [status,     setStatus]     = useState("NEW");
  const [priority,   setPriority]   = useState("P2");
  const [assigneeId, setAssigneeId] = useState("");
  const [createAnother, setCreateAnother] = useState(false);

  // Set default project once loaded
  useEffect(() => {
    if (projects.length && !projectId) setProjectId(projects[0].id);
  }, [projects, projectId]);

  // Reset form
  function reset() {
    setTitle(""); setDescription(""); setSeverity(""); setSteps("");
    setExpected(""); setActual(""); setModule(""); setEnvironment("");
    setVersion(""); setBrowser(""); setStatus("NEW"); setPriority("P2");
    setAssigneeId("");
  }

  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      if (createAnother) { reset(); }
      else { reset(); onClose(); }
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !projectId) return;
    mutation.mutate({
      projectId,
      type,
      priority,
      title:       title.trim(),
      description: description || undefined,
      status,
      assigneeId:  assigneeId || null,
    });
  }

  if (!open) return null;

  const isBug = type === "BUG";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden"
        style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
              New {isBug ? "Bug" : "Task"}
            </h2>
            {/* Project badge */}
            {projects.find(p => p.id === projectId) && (
              <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "var(--bg-hover)", color: "var(--text-muted)" }}>
                {projects.find(p => p.id === projectId)?.key}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Type toggle */}
            <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "var(--border)" }}>
              <button
                type="button"
                onClick={() => setType("BUG")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors",
                  isBug
                    ? "bg-red-900/60 text-red-300"
                    : "text-(--text-muted) hover:text-(--text-primary)"
                )}
                style={!isBug ? { backgroundColor: "var(--bg-hover)" } : {}}
              >
                <Bug size={13} /> Bug
              </button>
              <button
                type="button"
                onClick={() => setType("TASK")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors",
                  !isBug
                    ? "bg-blue-900/60 text-blue-300"
                    : "text-(--text-muted) hover:text-(--text-primary)"
                )}
                style={isBug ? { backgroundColor: "var(--bg-hover)" } : {}}
              >
                <ClipboardList size={13} /> Task
              </button>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-(--bg-hover) transition-colors" style={{ color: "var(--text-muted)" }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-1 overflow-hidden">
          {/* ── Left pane: form fields ── */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* Project selector (shown if multiple projects) */}
            {projects.length > 1 && (
              <Field label="Project">
                <Select value={projectId} onChange={e => setProjectId(e.target.value)}>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </Select>
              </Field>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={isBug ? "Short summary of the bug" : "Short summary of the task"}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                style={{ backgroundColor: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              />
            </div>

            {/* Description */}
            <Field label="Description">
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={isBug ? "Add details, context, or reproduction steps…" : "Add details or context…"}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/50 resize-y"
                style={{ backgroundColor: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              />
            </Field>

            {/* Bug-specific fields */}
            {isBug && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Severity">
                    <Select value={severity} onChange={e => setSeverity(e.target.value)}>
                      <option value="">Select severity…</option>
                      {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                  </Field>
                  <Field label="Steps to reproduce">
                    <textarea
                      rows={2}
                      value={steps}
                      onChange={e => setSteps(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-y focus:ring-2 focus:ring-blue-500/50"
                      style={{ backgroundColor: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Expected result">
                    <textarea
                      rows={2}
                      value={expected}
                      onChange={e => setExpected(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-y focus:ring-2 focus:ring-blue-500/50"
                      style={{ backgroundColor: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                    />
                  </Field>
                  <Field label="Actual result">
                    <textarea
                      rows={2}
                      value={actual}
                      onChange={e => setActual(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-y focus:ring-2 focus:ring-blue-500/50"
                      style={{ backgroundColor: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Module">
                    <input
                      type="text"
                      value={module}
                      onChange={e => setModule(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                      style={{ backgroundColor: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                    />
                  </Field>
                  <Field label="Environment">
                    <Select value={environment} onChange={e => setEnvironment(e.target.value)}>
                      <option value="">Select environment…</option>
                      {ENVS.map(e => <option key={e} value={e}>{e}</option>)}
                    </Select>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Version">
                    <input
                      type="text"
                      value={version}
                      onChange={e => setVersion(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                      style={{ backgroundColor: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                    />
                  </Field>
                  <Field label="Browser">
                    <input
                      type="text"
                      value={browser}
                      onChange={e => setBrowser(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                      style={{ backgroundColor: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                    />
                  </Field>
                </div>
              </>
            )}
          </div>

          {/* ── Right pane: properties ── */}
          <div
            className="w-60 shrink-0 border-l overflow-y-auto px-5 py-5 space-y-5"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Properties
            </p>

            <Field label="Status">
              <Select value={status} onChange={e => setStatus(e.target.value)}>
                {STATUSES.map(s => (
                  <option key={s} value={s}>{statusLabel[s]}</option>
                ))}
              </Select>
            </Field>

            <Field label="Priority">
              <Select value={priority} onChange={e => setPriority(e.target.value)}>
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Select>
            </Field>

            <Field label="Assignee">
              <Select value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
                <option value="">Unassigned</option>
                {users.map((u: User) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </Select>
            </Field>
          </div>
        </form>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-3 border-t"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
        >
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--text-secondary)" }}>
            <input
              type="checkbox"
              checked={createAnother}
              onChange={e => setCreateAnother(e.target.checked)}
              className="w-3.5 h-3.5 accent-blue-500"
            />
            Create another
          </label>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-sm transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              form=""
              onClick={handleSubmit}
              disabled={!title.trim() || mutation.isPending}
              className="px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
              style={{ backgroundColor: "var(--accent)" }}
            >
              {mutation.isPending
                ? "Creating…"
                : `Create ${isBug ? "Bug" : "Task"}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tiny helpers ──────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Select({
  value, onChange, children,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
      style={{
        backgroundColor: "var(--bg-hover)",
        border: "1px solid var(--border)",
        color: "var(--text-primary)",
      }}
    >
      {children}
    </select>
  );
}
