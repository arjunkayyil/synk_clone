import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely (shadcn/ui style helper). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a date as "X hours/days ago". Safe against Next.js SSR/prerendering. */
export function timeAgo(date: Date | string, nowMs?: number): string {
  if (typeof window === "undefined" && nowMs === undefined) {
    return "";
  }
  const d = typeof date === "string" ? new Date(date) : date;
  const current = nowMs !== undefined ? nowMs : (typeof window !== "undefined" ? Date.now() : d.getTime());
  const seconds = Math.max(0, Math.floor((current - d.getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/** Build a display ID like LB-BUG-928 */
export function taskDisplayId(
  projectKey: string,
  type: string,
  number: number
): string {
  return `${projectKey}-${type}-${number}`;
}
