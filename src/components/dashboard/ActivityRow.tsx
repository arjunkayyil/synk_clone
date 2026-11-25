/**
 * src/components/dashboard/ActivityRow.tsx
 * A single row in the "All Workspace Tasks & Activity" list.
 */
"use client";

import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { timeAgo, taskDisplayId } from "@/lib/utils";
import type { Task } from "@/lib/types";

interface ActivityRowProps {
  task: Task;
}

export function ActivityRow({ task }: ActivityRowProps) {
  const displayId = taskDisplayId(
    task.project?.key ?? "??",
    task.type,
    task.number
  );

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-(--bg-hover) transition-colors cursor-pointer border-b"
      style={{ borderColor: "var(--border)" }}
    >
      {/* ID */}
      <span
        className="text-xs font-mono shrink-0 w-28"
        style={{ color: "var(--text-muted)" }}
      >
        {displayId}
      </span>

      {/* Type badge */}
      <Badge value={task.type} variant="type" className="shrink-0" />

      {/* Priority badge */}
      <Badge value={task.priority} variant="priority" className="shrink-0" />

      {/* Title */}
      <span
        className="flex-1 text-sm truncate"
        style={{ color: "var(--text-primary)" }}
      >
        {task.title}
      </span>

      {/* Status badge */}
      <Badge value={task.status} variant="status" className="shrink-0" />

      {/* Assignee */}
      <div className="shrink-0 w-20 flex items-center gap-1.5">
        {task.assignee ? (
          <>
            <Avatar name={task.assignee.name} size="sm" />
            <span className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
              {task.assignee.name.split(" ")[0]}
            </span>
          </>
        ) : (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Unassigned
          </span>
        )}
      </div>

      {/* Time ago */}
      <span className="text-xs shrink-0 w-20 text-right" style={{ color: "var(--text-muted)" }}>
        {timeAgo(task.createdAt)}
      </span>
    </div>
  );
}
