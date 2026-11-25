"use client";

/**
 * src/components/layout/TopBar.tsx
 * The top navigation bar:
 * - Left: Workspace dropdown ("Cybroque")
 * - Center: Global search ("Find anything in Synk") with ⌘K
 * - Right:
 *    - Timer capsule (with green running dot, pause/play, stop button)
 *    - Notifications bell icon (LEFT side of "Add work" as requested) with popover
 *    - "+ Add work" button (opens New Bug/Task modal)
 *    - User badge (AR) with dropdown menu (Settings, Light mode, Sign out, etc. - excluding Compact density & Notifications inside as requested)
 *    - Toggle right panel icon
 */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  Plus,
  Search,
  Pause,
  Play,
  Square,
  ChevronDown,
  Building2,
  Settings,
  Sun,
  LogOut,
  Check,
  PanelRight,
} from "lucide-react";
import { useCreateModal } from "@/app/providers";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";
import { cn } from "@/lib/utils";

interface TopBarProps {
  userName?: string;
}

export function TopBar({ userName = "arjunkayyil" }: TopBarProps) {
  const { isCreateOpen, openCreate, closeCreate } = useCreateModal();

  // Timer state
  const [timerRunning, setTimerRunning] = useState(true);
  const [seconds, setSeconds] = useState(2 * 3600 + 28 * 60 + 27); // 02:28:27

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  function formatTime(totalSec: number) {
    const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
    const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
    const s = String(totalSec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  // Dropdown states
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (wsRef.current && !wsRef.current.contains(event.target as Node)) {
        setShowWorkspaceMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header
        className="h-12 flex items-center px-4 gap-3 border-b shrink-0 select-none"
        style={{
          backgroundColor: "var(--bg-panel)",
          borderColor: "var(--border)",
        }}
      >
        {/* Workspace selector */}
        <div className="relative" ref={wsRef}>
          <button
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-(--bg-hover)"
            style={{ color: "var(--text-primary)" }}
          >
            <Building2 size={14} className="text-blue-400" />
            <span className="font-semibold">Cybroque</span>
            <ChevronDown size={13} className="text-(--text-muted)" />
          </button>

          {showWorkspaceMenu && (
            <div
              className="absolute left-0 mt-1.5 w-48 rounded-xl shadow-xl border py-1 z-50"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
            >
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-(--text-muted)">
                Workspaces
              </div>
              <div className="flex items-center justify-between px-3 py-2 text-xs font-medium bg-blue-600/10 text-blue-300">
                <span className="flex items-center gap-2">
                  <Building2 size={13} /> Cybroque
                </span>
                <Check size={13} />
              </div>
            </div>
          )}
        </div>

        {/* Global search */}
        <div
          className="flex items-center gap-2 flex-1 max-w-sm rounded-lg px-3 py-1.5 text-xs transition-colors"
          style={{ backgroundColor: "var(--bg-hover)", color: "var(--text-muted)" }}
        >
          <Search size={14} />
          <input
            type="text"
            placeholder="Find anything in Synk"
            className="bg-transparent outline-none flex-1 text-xs"
            style={{ color: "var(--text-primary)" }}
          />
          <kbd
            className="text-[10px] border rounded px-1.5 py-0.5"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            ⌘K
          </kbd>
        </div>

        <div className="flex-1" />

        {/* Timer Capsule: • 02:28:27 || ■ */}
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full text-xs border"
          style={{
            backgroundColor: "rgba(14, 22, 38, 0.8)",
            borderColor: "rgba(59, 130, 246, 0.3)",
          }}
        >
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              timerRunning ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
            )}
          />
          <span className="tabular-nums font-mono text-xs font-medium text-blue-300">
            {formatTime(seconds)}
          </span>
          <button
            onClick={() => setTimerRunning(!timerRunning)}
            title={timerRunning ? "Pause timer" : "Resume timer"}
            className="text-blue-400 hover:text-white transition-colors ml-1"
          >
            {timerRunning ? <Pause size={12} /> : <Play size={12} />}
          </button>
          <button
            onClick={() => {
              setTimerRunning(false);
              setSeconds(0);
            }}
            title="Stop timer"
            className="text-(--text-muted) hover:text-red-400 transition-colors"
          >
            <Square size={11} fill="currentColor" />
          </button>
        </div>

        {/* Notifications Icon (placed on the LEFT side of "Add work" as requested) */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg transition-colors hover:bg-(--bg-hover)"
            style={{ color: "var(--text-secondary)" }}
            title="Notifications"
          >
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-500" />
          </button>

          {/* Notifications Popover */}
          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl border p-4 z-50 space-y-4"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border)",
              }}
            >
              <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                Notifications
              </h3>
              <div className="py-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                You&apos;re all caught up.
              </div>
              <button
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium border transition-colors hover:bg-(--bg-hover)"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
              >
                <Bell size={13} />
                <span>Enable push</span>
              </button>
            </div>
          )}
        </div>

        {/* Add work button */}
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer hover:bg-blue-600"
          style={{ backgroundColor: "var(--accent)" }}
        >
          <Plus size={14} />
          Add work
        </button>

        {/* User profile avatar dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1 p-1 rounded-lg hover:bg-(--bg-hover) transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-[11px] font-semibold text-white">
              AR
            </div>
            <ChevronDown size={12} className="text-(--text-muted)" />
          </button>

          {/* User Popover Menu */}
          {showUserMenu && (
            <div
              className="absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl border py-2 z-50 divide-y"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border)",
              }}
            >
              {/* Header profile info */}
              <div className="px-4 py-3 space-y-0.5">
                <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                  arjunkayyil
                </p>
                <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                  arjunkayyil@gmail.com
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400 pt-1">
                  MEMBER
                </p>
              </div>

              {/* Workspace section */}
              <div className="px-4 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-(--text-muted) mb-1.5">
                  WORKSPACE
                </p>
                <div className="flex items-center justify-between text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                  <span className="flex items-center gap-2">
                    <Building2 size={13} className="text-(--text-muted)" />
                    Cybroque <span className="text-[11px] text-(--text-muted)">Member</span>
                  </span>
                  <Check size={14} className="text-blue-400" />
                </div>
              </div>

              {/* Action items: Settings, Light mode, Sign out */}
              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium transition-colors hover:bg-(--bg-hover)"
                  style={{ color: "var(--text-primary)" }}
                >
                  <Settings size={14} className="text-(--text-muted)" />
                  <span>Settings</span>
                </Link>

                <button
                  type="button"
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium transition-colors hover:bg-(--bg-hover) text-left"
                  style={{ color: "var(--text-primary)" }}
                >
                  <Sun size={14} className="text-(--text-muted)" />
                  <span>Light mode</span>
                </button>

                <button
                  type="button"
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium transition-colors hover:bg-(--bg-hover) text-left text-red-400"
                >
                  <LogOut size={14} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right panel toggle icon */}
        <button
          className="p-1.5 rounded-lg text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-hover) transition-colors"
          title="Toggle side panel"
        >
          <PanelRight size={16} />
        </button>
      </header>

      {/* Global modal opened by "Add work" */}
      <CreateTaskModal open={isCreateOpen} onClose={closeCreate} />
    </>
  );
}
