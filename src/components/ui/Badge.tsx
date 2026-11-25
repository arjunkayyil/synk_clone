/**
 * src/components/ui/Badge.tsx
 * A small coloured badge for task type, priority, and status.
 */
import { cn } from "@/lib/utils";

type BadgeVariant = "type" | "priority" | "status" | "default";

const typeColors: Record<string, string> = {
  BUG:   "bg-red-900/60 text-red-300 border border-red-700/50",
  TASK:  "bg-blue-900/60 text-blue-300 border border-blue-700/50",
  STORY: "bg-purple-900/60 text-purple-300 border border-purple-700/50",
};

const priorityColors: Record<string, string> = {
  P1: "bg-red-900/50 text-red-400 border border-red-700/40",
  P2: "bg-amber-900/50 text-amber-400 border border-amber-700/40",
  P3: "bg-slate-700/60 text-slate-400 border border-slate-600/40",
};

const statusColors: Record<string, string> = {
  NEW:         "bg-slate-700/60 text-slate-300 border border-slate-600/40",
  IN_PROGRESS: "bg-blue-900/60 text-blue-300 border border-blue-700/50",
  FIXED:       "bg-green-900/60 text-green-300 border border-green-700/50",
  CLOSED:      "bg-slate-800/60 text-slate-500 border border-slate-700/40",
};

const statusLabels: Record<string, string> = {
  NEW:         "New",
  IN_PROGRESS: "In Progress",
  FIXED:       "Fixed",
  CLOSED:      "Closed",
};

interface BadgeProps {
  value: string;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ value, variant = "default", className }: BadgeProps) {
  let colorClass = "bg-slate-700 text-slate-300";
  let label = value;

  if (variant === "type")     colorClass = typeColors[value]     ?? colorClass;
  if (variant === "priority") colorClass = priorityColors[value] ?? colorClass;
  if (variant === "status") {
    colorClass = statusColors[value] ?? colorClass;
    label = statusLabels[value] ?? value;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase",
        colorClass,
        className
      )}
    >
      {label}
    </span>
  );
}
