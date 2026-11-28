/**
 * src/components/layout/RightPanel.tsx
 * The right "Work in hand" panel with tabs: Work / Space / Nyx.
 */
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Hand, Globe, Sparkles, Timer, Pause, Play, Square, Flame } from "lucide-react";
import { useCreateModal } from "@/app/providers";
import { NyxChat } from "@/components/nyx/NyxChat";
import { useFocusTimer } from "@/context/FocusTimerContext";
import { StopTimerModal } from "@/components/timer/StopTimerModal";

const tabs = [
  { label: "Work",  icon: Hand },
  { label: "Space", icon: Globe },
  { label: "Nyx",   icon: Sparkles },
];

export function RightPanel() {
  const [activeTab, setActiveTab] = useState("Work");
  const { isRightPanelOpen } = useCreateModal();

  if (!isRightPanelOpen) return null;

  return (
    <aside
      className={cn(
        "flex flex-col shrink-0 border-l transition-all duration-200",
        activeTab === "Nyx" ? "w-80" : "w-64"
      )}
      style={{
        backgroundColor: "var(--bg-panel)",
        borderColor: "var(--border)",
      }}
    >
      {/* Tab bar */}
      <div
        className="flex border-b"
        style={{ borderColor: "var(--border)" }}
      >
        {tabs.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => setActiveTab(label)}
            className={cn(
              "flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors cursor-pointer",
              activeTab === label
                ? "text-blue-400 border-b-2 border-blue-500"
                : "text-(--text-muted) hover:text-(--text-secondary)"
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Panel body */}
      <div className="flex-1 overflow-hidden p-3 flex flex-col min-h-0">
        {activeTab === "Work" && (
          <div className="flex-1 overflow-y-auto">
            <WorkPanel />
          </div>
        )}
        {activeTab === "Space" && (
          <div className="flex-1 overflow-y-auto">
            <EmptyState message="Your workspace notes and links will appear here." />
          </div>
        )}
        {activeTab === "Nyx" && <NyxChat />}
      </div>
    </aside>
  );
}

function WorkPanel() {
  const { timerState, seconds, activeTask, start, pause, resume, formatTime, formatShort } =
    useFocusTimer();
  const [showStop, setShowStop] = useState(false);

  const isIdle    = timerState === "idle";
  const isRunning = timerState === "running";
  const isPaused  = timerState === "paused";
  const isActive  = !isIdle;

  return (
    <>
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
          Work in hand
        </p>

        {/* Active task chip */}
        {activeTask ? (
          <div
            className="rounded-lg border p-3 space-y-1"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-hover)" }}
          >
            <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
              <span className="font-mono">{activeTask.project?.key}-{activeTask.type}-{activeTask.number}</span>
            </div>
            <p className="text-xs font-medium leading-snug" style={{ color: "var(--text-primary)" }}>
              {activeTask.title}
            </p>
          </div>
        ) : (
          /* Drop zone */
          <div
            className="rounded-lg border-2 border-dashed p-4 text-center text-xs"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            <Hand size={24} className="mx-auto mb-2 opacity-30" />
            Drag a task here to claim it and start the timer.
          </div>
        )}

        {/* Mini timer */}
        <div
          className="rounded-lg border p-3 space-y-2"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
        >
          {/* Clock + elapsed */}
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "tabular-nums font-mono text-lg font-bold",
                isRunning ? "text-blue-400" : isPaused ? "text-amber-400" : "text-slate-500"
              )}
            >
              {formatTime(seconds)}
            </span>
            {isActive && (
              <span className="flex items-center gap-1 text-[11px] text-orange-400 font-medium">
                <Flame size={12} />
                {formatShort(seconds)}
              </span>
            )}
          </div>

          <p className="text-[10px] uppercase font-semibold tracking-widest" style={{ color: "var(--text-muted)" }}>
            {isRunning ? "Session Active" : isPaused ? "Timer Paused" : "No Active Session"}
          </p>

          {/* Controls */}
          {isIdle ? (
            <button
              onClick={() => start()}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
            >
              <Timer size={13} />
              Start Session
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={isRunning ? pause : resume}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold text-white transition-colors",
                  isRunning ? "bg-slate-700 hover:bg-slate-600" : "bg-emerald-600 hover:bg-emerald-500"
                )}
              >
                {isRunning ? <Pause size={12} /> : <Play size={12} />}
                {isRunning ? "Pause" : "Resume"}
              </button>
              <button
                onClick={() => setShowStop(true)}
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-colors border"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)", backgroundColor: "var(--bg-hover)" }}
              >
                <Square size={11} />
                Finish
              </button>
            </div>
          )}
        </div>
      </div>

      <StopTimerModal open={showStop} onClose={() => setShowStop(false)} />
    </>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-xs text-center mt-8" style={{ color: "var(--text-muted)" }}>
      {message}
    </p>
  );
}

