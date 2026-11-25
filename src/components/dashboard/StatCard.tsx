/**
 * src/components/dashboard/StatCard.tsx
 * A single stat card for the dashboard (e.g., "Total Projects: 5").
 */
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color?: string;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, color = "text-blue-400", className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-5 flex items-start gap-4",
        className
      )}
      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      <div
        className={cn("p-2 rounded-lg", color.replace("text-", "bg-").replace("-400", "-900/60"))}
      >
        <Icon size={20} className={color} />
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          {value}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          {label}
        </p>
      </div>
    </div>
  );
}
