"use client";

/**
 * src/components/timer/StopTimerModal.tsx
 * Modal shown when clicking "Finish" on the focus timer.
 * Options: End session | Close your day | Keep it running
 */

import { X, Square, Sunset } from "lucide-react";
import { useFocusTimer } from "@/context/FocusTimerContext";

interface Props {
  open:    boolean;
  onClose: () => void;
}

export function StopTimerModal({ open, onClose }: Props) {
  const { seconds, formatTime, stop } = useFocusTimer();

  if (!open) return null;

  function handleEndSession() {
    stop();
    onClose();
  }

  function handleCloseDay() {
    stop();
    onClose();
    // Could navigate to a summary page in the future
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className="relative z-10 w-[380px] rounded-2xl shadow-2xl border p-6"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-(--bg-hover) transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="mb-5">
          <h2 className="text-base font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            Stop the timer?
          </h2>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Your session is at{" "}
            <span className="font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
              {formatTime(seconds)}
            </span>
            . How do you want to wrap up?
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {/* End session */}
          <button
            onClick={handleEndSession}
            className="w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-colors hover:border-blue-500/40 hover:bg-blue-500/5 group"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-hover)" }}
          >
            <div
              className="mt-0.5 flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
              style={{ backgroundColor: "var(--bg-panel)" }}
            >
              <Square size={16} style={{ color: "var(--text-secondary)" }} />
            </div>
            <div>
              <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>
                End session
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Stop the current run. You can start another session later.
              </p>
            </div>
          </button>

          {/* Close your day */}
          <button
            onClick={handleCloseDay}
            className="w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-colors hover:border-green-500/40 hover:bg-green-500/5 group"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-hover)" }}
          >
            <div className="mt-0.5 flex items-center justify-center w-8 h-8 rounded-lg shrink-0 bg-green-500/15">
              <Sunset size={16} className="text-green-400" />
            </div>
            <div>
              <p className="text-sm font-semibold mb-0.5 text-green-400">
                Close your day
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Finish for today and review everything you tracked.
              </p>
            </div>
          </button>
        </div>

        {/* Keep running */}
        <button
          onClick={onClose}
          className="mt-5 w-full text-center text-xs font-medium transition-colors hover:underline"
          style={{ color: "var(--text-muted)" }}
        >
          Keep it running
        </button>
      </div>
    </div>
  );
}
