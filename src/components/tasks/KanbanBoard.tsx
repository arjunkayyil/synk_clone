"use client";

/**
 * src/components/tasks/KanbanBoard.tsx
 * Drag and drop Kanban board matching Synk's board view:
 * Columns: Open, Active, Done, Cancelled.
 * Allows dragging task cards between columns with immediate status updates.
 */

import React, { useState } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { taskDisplayId, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { Task } from "@/lib/types";

interface Props {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onUpdateStatus: (taskId: string, newStatus: string) => void;
}

interface ColumnDef {
  id: string;
  label: string;
  statusMatch: string[];
  icon: string;
}

const COLUMNS: ColumnDef[] = [
  { id: "OPEN", label: "Open", statusMatch: ["NEW"], icon: "○" },
  { id: "ACTIVE", label: "Active", statusMatch: ["IN_PROGRESS"], icon: "⊙" },
  { id: "DONE", label: "Done", statusMatch: ["FIXED"], icon: "✔" },
  { id: "CANCELLED", label: "Cancelled", statusMatch: ["CLOSED", "CANCELLED"], icon: "⊗" },
];

export function KanbanBoard({ tasks, onSelectTask, onUpdateStatus }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeTaskId = String(active.id);
    let targetColId = String(over.id);

    // If dropped over a task item instead of a column, determine the column of that task
    if (!COLUMNS.some(c => c.id === targetColId)) {
      const overTask = tasks.find(t => t.id === targetColId);
      if (overTask) {
        if (overTask.status === "NEW") targetColId = "OPEN";
        else if (overTask.status === "IN_PROGRESS") targetColId = "ACTIVE";
        else if (overTask.status === "FIXED" || overTask.status === "CLOSED") targetColId = "DONE";
        else targetColId = "CANCELLED";
      }
    }

    const currentTask = tasks.find(t => t.id === activeTaskId);
    if (!currentTask) return;

    // Convert column target to task status
    let nextStatus = currentTask.status;
    if (targetColId === "OPEN") nextStatus = "NEW";
    else if (targetColId === "ACTIVE") nextStatus = "IN_PROGRESS";
    else if (targetColId === "DONE") nextStatus = "FIXED";
    else if (targetColId === "CANCELLED") nextStatus = "CLOSED";

    if (currentTask.status !== nextStatus) {
      onUpdateStatus(activeTaskId, nextStatus);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start pb-8">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => col.statusMatch.includes(t.status));
          return (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={colTasks}
              onSelectTask={onSelectTask}
            />
          );
        })}
      </div>
    </DndContext>
  );
}

function KanbanColumn({
  column,
  tasks,
  onSelectTask,
}: {
  column: ColumnDef;
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-2xl border flex flex-col min-h-[550px] transition-colors p-3",
        isOver ? "border-blue-500/80 bg-blue-950/20" : "border-(--border) bg-(--bg-card)"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-2 py-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-(--text-muted)">{column.icon}</span>
          <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            {column.label}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: "var(--bg-hover)", color: "var(--text-muted)" }}
          >
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Column Tasks */}
      <div className="flex-1 space-y-3">
        {tasks.length === 0 ? (
          <div className="h-32 flex items-center justify-center border border-dashed rounded-xl border-(--border)/60 text-xs text-(--text-muted)">
            Drop task here
          </div>
        ) : (
          tasks.map(task => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onSelect={() => onSelectTask(task)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function SortableTaskCard({ task, onSelect }: { task: Task; onSelect: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  const displayId = taskDisplayId(task.project?.key ?? "LB", task.type, task.number);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onSelect}
      className={cn(
        "p-3.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing hover:border-[#58a6ff]/60 space-y-2.5 shadow-sm",
        "bg-[#161b22] border-[#30363d]"
      )}
    >
      {/* Top Meta: ID, Badges */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-mono text-xs text-[#8b949e]">
          <span className="text-[#3fb950]">◎</span>
          <span>{displayId}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge value={task.type} variant="type" className="text-[10px] px-2 py-0" />
          <Badge value={task.priority} variant="priority" className="text-[10px] px-2 py-0" />
        </div>
      </div>

      {/* Title */}
      <h3
        className="text-[13px] font-semibold leading-snug line-clamp-2 text-[#f0f6fc]"
      >
        {task.title}
      </h3>

      {/* Footer: Assignee & Status indicator */}
      <div className="flex items-center justify-between pt-1.5 text-xs border-t border-[#30363d]/50">
        <span className="text-[11px] text-[#8b949e] flex items-center gap-1 truncate max-w-[150px]">
          {task.assignee ? (
            <>
              <span className="text-xs">👤</span>
              <span className="truncate">{task.assignee.name}</span>
            </>
          ) : (
            <span className="text-gray-500">Unassigned</span>
          )}
        </span>

        <span
          className={cn(
            "text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1",
            task.status === "FIXED"
              ? "text-purple-400 border border-purple-500/30 bg-purple-950/20"
              : task.status === "CLOSED"
              ? "text-emerald-400 border border-emerald-500/30 bg-emerald-950/20"
              : task.status === "IN_PROGRESS"
              ? "text-amber-300 border border-amber-500/30 bg-amber-950/20"
              : "text-slate-400 border border-slate-700 bg-slate-800/40"
          )}
        >
          {task.status === "IN_PROGRESS" ? (
            <>
              <span className="text-amber-400 text-[10px]">⊙</span> In progress
            </>
          ) : task.status === "FIXED" ? (
            <>
              <span className="text-purple-400 text-[10px]">✔</span> Fixed
            </>
          ) : task.status === "CLOSED" ? (
            <>
              <span className="text-emerald-400 text-[10px]">✔</span> Closed
            </>
          ) : (
            <>
              <span className="text-slate-400 text-[10px]">○</span> New
            </>
          )}
        </span>
      </div>
    </div>
  );
}
