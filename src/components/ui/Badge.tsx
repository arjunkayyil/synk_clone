/**
 * src/components/ui/Badge.tsx
 * Coloured badges matching GitHub Projects style tag pills.
 */
import { cn } from "@/lib/utils";

type BadgeVariant = "type" | "priority" | "status" | "default";

const typeColors: Record<string, string> = {
  BUG:   "bg-red-50 text-red-600 border border-red-200 dark:bg-[#da3633]/20 dark:text-[#f85149] dark:border-[#f85149]/40",
  TASK:  "bg-blue-50 text-blue-600 border border-blue-200 dark:bg-[#1f6feb]/20 dark:text-[#58a6ff] dark:border-[#388bfd]/40",
  STORY: "bg-purple-50 text-purple-600 border border-purple-200 dark:bg-[#8957e5]/20 dark:text-[#bc8cff] dark:border-[#a371f7]/40",
};

const priorityColors: Record<string, string> = {
  P1: "bg-red-50 text-red-700 border border-red-200 dark:bg-[#da3633]/20 dark:text-[#f85149] dark:border-[#f85149]/40",
  P2: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-[#d29922]/20 dark:text-[#e3b341] dark:border-[#d29922]/40",
  P3: "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-[#30363d]/50 dark:text-[#8b949e] dark:border-[#30363d]",
};

const statusColors: Record<string, string> = {
  NEW:         "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-[#30363d]/50 dark:text-[#8b949e] dark:border-[#30363d]",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-[#1f6feb]/20 dark:text-[#58a6ff] dark:border-[#388bfd]/40",
  FIXED:       "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-[#238636]/20 dark:text-[#3fb950] dark:border-[#2ea043]/40",
  CLOSED:      "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-[#8957e5]/20 dark:text-[#bc8cff] dark:border-[#a371f7]/40",
};

const statusLabels: Record<string, string> = {
  NEW:         "Open",
  IN_PROGRESS: "Active",
  FIXED:       "Done",
  CLOSED:      "Closed",
};

interface BadgeProps {
  value: string;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ value, variant = "default", className }: BadgeProps) {
  let colorClass = "bg-[#21262d] text-[#c9d1d9] border border-[#30363d]";
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
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium tracking-wide",
        colorClass,
        className
      )}
    >
      {label}
    </span>
  );
}
