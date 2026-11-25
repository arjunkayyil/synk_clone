/**
 * src/components/dashboard/ProjectCard.tsx
 * Project card shown on the dashboard: name, key badge, progress bar, open task count.
 */
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  id: string;
  name: string;
  projectKey: string;
  totalTasks: number;
  openTasks: number;
  completedTasks: number;
}

export function ProjectCard({
  id,
  name,
  projectKey,
  totalTasks,
  openTasks,
  completedTasks,
}: ProjectCardProps) {
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Link href="/tasks">
      <div
        className="rounded-xl border p-5 hover:border-blue-700/60 transition-colors cursor-pointer group"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <span
              className="inline-block text-[10px] font-bold tracking-widest px-1.5 py-0.5 rounded mb-1"
              style={{ backgroundColor: "var(--bg-hover)", color: "var(--text-muted)" }}
            >
              {projectKey}
            </span>
            <h3
              className="font-semibold text-sm group-hover:text-blue-400 transition-colors"
              style={{ color: "var(--text-primary)" }}
            >
              {name}
            </h3>
          </div>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {openTasks} open
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: "var(--bg-hover)" }}
        >
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
          {progress}% complete · {totalTasks} tasks total
        </p>
      </div>
    </Link>
  );
}
