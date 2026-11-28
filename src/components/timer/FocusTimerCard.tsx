"use client";

/**
 * src/components/timer/FocusTimerCard.tsx
 * The large FOCUS TIMER section shown on the dashboard.
 * Shows HH:MM:SS, session state label, Pause/Resume + Finish buttons.
 */

import { useState } from "react";
import { Pause, Play, Square, Flame, Timer } from "lucide-react";
import { useFocusTimer } from "@/context/FocusTimerContext";
import { StopTimerModal } from "./StopTimerModal";
import { cn } from "@/lib/utils";

export function FocusTimerCard() {
  const { timerState, seconds, activeTask, start, pause, resume, formatTime, formatShort } =
    useFocusTimer();
  const [showStop, setShowStop] = useState(false);

  const isIdle    = timerState === "idle";
  const isRunning = timerState === "running";
  const isPaused  = timerState === "paused";

  return (
    <>
      <div
        className="rounded-xl border p-5"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                isRunning ? "bg-emerald-500 animate-pulse" : isPaused ? "bg-amber-400" : "bg-slate-500"
              )}
            />
            <span className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--text-muted)" }}>
              Focus Timer
            </span>
            {activeTask && (
              <span
                className="text-[11px] px-2 py-0.5 rounded-full border"
                style={{ color: "var(--text-secondary)", borderColor: "var(--border)", backgroundColor: "var(--bg-hover)" }}
              >
                {activeTask.project?.key}-{activeTask.type}-{activeTask.number}
              </span>
            )}
          </div>

          {!isIdle && (
            <div className="flex items-center gap-1 text-xs text-orange-400 font-medium">
              <Flame size={13} />
              <span>{formatShort(seconds)}</span>
            </div>
          )}
        </div>

        {/* Clock */}
        <div className="text-center py-4">
          <div
            className={cn(
              "text-5xl font-bold tabular-nums tracking-tight font-mono transition-colors",
              isRunning ? "text-blue-400" : isPaused ? "text-amber-400" : "text-slate-500"
            )}
          >
            {formatTime(seconds)}
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-widest mt-2"
            style={{ color: "var(--text-muted)" }}>
            {isRunning ? "Session Active" : isPaused ? "Timer Paused" : "No Active Session"}
          </p>
        </div>

        {/* Controls */}
        {isIdle ? (
          <button
            onClick={() => start()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-md"
          >
            <Timer size={15} />
            Start Focus Session
          </button>
        ) : (
          <div className="flex gap-3">
            {/* Pause / Resume */}
            <button
              onClick={isRunning ? pause : resume}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors",
                isRunning
                  ? "bg-slate-700 hover:bg-slate-600 text-white"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              )}
            >
              {isRunning ? <Pause size={14} /> : <Play size={14} />}
              {isRunning ? "Pause" : "Resume"}
            </button>

            {/* Finish */}
            <button
              onClick={() => setShowStop(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors border"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--bg-hover)",
                color: "var(--text-primary)",
              }}
            >
              <Square size={13} />
              Finish
            </button>
          </div>
        )}
      </div>

      <StopTimerModal open={showStop} onClose={() => setShowStop(false)} />
    </>
  );
}
