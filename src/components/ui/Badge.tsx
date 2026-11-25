/**
 * src/components/ui/Badge.tsx
 * Coloured badges matching GitHub Projects style tag pills.
 */
import { cn } from "@/lib/utils";

type BadgeVariant = "type" | "priority" | "status" | "default";

const typeColors: Record<string, string> = {
  BUG:   "bg-[#da3633]/20 text-[#f85149] border border-[#f85149]/40",
  TASK:  "bg-[#1f6feb]/20 text-[#58a6ff] border border-[#388bfd]/40",
  STORY: "bg-[#8957e5]/20 text-[#bc8cff] border border-[#a371f7]/40",
};

const priorityColors: Record<string, string> = {
  P1: "bg-[#da3633]/20 text-[#f85149] border border-[#f85149]/40",
  P2: "bg-[#d29922]/20 text-[#e3b341] border border-[#d29922]/40",
  P3: "bg-[#30363d]/50 text-[#8b949e] border border-[#30363d]",
};

const statusColors: Record<string, string> = {
  NEW:         "bg-[#30363d]/50 text-[#8b949e] border border-[#30363d]",
  IN_PROGRESS: "bg-[#1f6feb]/20 text-[#58a6ff] border border-[#388bfd]/40",
  FIXED:       "bg-[#238636]/20 text-[#3fb950] border border-[#2ea043]/40",
  CLOSED:      "bg-[#8957e5]/20 text-[#bc8cff] border border-[#a371f7]/40",
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
