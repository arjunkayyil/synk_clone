/**
 * src/components/layout/TopBar.tsx
 * The top navigation bar: logo, search, timer placeholder, notifications, Add work, user avatar.
 */
"use client";

import { Bell, Plus, Search, Timer } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

interface TopBarProps {
  userName?: string;
}

export function TopBar({ userName = "Alice Chen" }: TopBarProps) {
  return (
    <header
      className="h-12 flex items-center px-4 gap-3 border-b shrink-0"
      style={{
        backgroundColor: "var(--bg-panel)",
        borderColor: "var(--border)",
      }}
    >
      {/* Logo / workspace name */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
          S
        </div>
        <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
          Synk
        </span>
      </div>

      {/* Global search */}
      <div
        className="flex items-center gap-2 flex-1 max-w-sm rounded-md px-3 py-1.5 text-sm"
        style={{ backgroundColor: "var(--bg-hover)", color: "var(--text-muted)" }}
      >
        <Search size={14} />
        <span>Search tasks, projects…</span>
        <kbd className="ml-auto text-[10px] border rounded px-1" style={{ borderColor: "var(--border)" }}>
          ⌘K
        </kbd>
      </div>

      <div className="flex-1" />

      {/* Timer button (placeholder) */}
      <button
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors"
        style={{ color: "var(--text-secondary)" }}
        title="Start timer"
      >
        <Timer size={15} />
        <span className="tabular-nums text-xs font-mono">00:00:00</span>
      </button>

      {/* Notifications */}
      <button
        className="relative p-1.5 rounded-md transition-colors"
        style={{ color: "var(--text-secondary)" }}
        title="Notifications"
      >
        <Bell size={16} />
        <span
          className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-blue-500"
        />
      </button>

      {/* Add work */}
      <button
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-white transition-colors"
        style={{ backgroundColor: "var(--accent)" }}
      >
        <Plus size={15} />
        Add work
      </button>

      {/* User avatar */}
      <Avatar name={userName} size="sm" />
    </header>
  );
}
