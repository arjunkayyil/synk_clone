"use client";

/**
 * src/context/FocusTimerContext.tsx
 * Global focus-timer state shared between TopBar, RightPanel, and Dashboard.
 * - Start / Pause / Resume / Stop
 * - Tracks active task (optional)
 * - Persists elapsed seconds in localStorage so a page refresh doesn't reset it
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import type { Task } from "@/lib/types";

type TimerState = "idle" | "running" | "paused";

interface FocusTimerCtx {
  timerState:    TimerState;
  seconds:       number;
  activeTask:    Task | null;

  start:         (task?: Task) => void;
  pause:         () => void;
  resume:        () => void;
  stop:          () => void;          // just stops, resets
  formatTime:    (s: number) => string;
  formatShort:   (s: number) => string; // e.g. "1h 10m"
}

const FocusTimerContext = createContext<FocusTimerCtx>({
  timerState:  "idle",
  seconds:     0,
  activeTask:  null,
  start:       () => {},
  pause:       () => {},
  resume:      () => {},
  stop:        () => {},
  formatTime:  () => "00:00:00",
  formatShort: () => "0m",
});

export function useFocusTimer() {
  return useContext(FocusTimerContext);
}

const LS_KEY    = "synk_focus_seconds";
const LS_STATE  = "synk_focus_state";
const LS_TASK   = "synk_focus_task";
const LS_START  = "synk_focus_wallstart"; // wall-clock start for drift correction

export function FocusTimerProvider({ children }: { children: ReactNode }) {
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [seconds,    setSeconds]    = useState(0);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Restore from localStorage on mount ──────────────────────────────────────
  useEffect(() => {
    const savedState   = localStorage.getItem(LS_STATE)  as TimerState | null;
    const savedSeconds = Number(localStorage.getItem(LS_KEY) || 0);
    const savedTask    = localStorage.getItem(LS_TASK);
    const wallStart    = Number(localStorage.getItem(LS_START) || 0);

    if (savedState === "running" && wallStart) {
      // Correct for time elapsed while page was closed
      const elapsed = Math.floor((Date.now() - wallStart) / 1000);
      setSeconds(savedSeconds + elapsed);
      setTimerState("running");
    } else if (savedState === "paused") {
      setSeconds(savedSeconds);
      setTimerState("paused");
    }

    if (savedTask) {
      try { setActiveTask(JSON.parse(savedTask)); } catch { /* ignore */ }
    }
  }, []);

  // ── Tick ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (timerState === "running") {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          const next = s + 1;
          localStorage.setItem(LS_KEY, String(next));
          return next;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerState]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const start = useCallback((task?: Task) => {
    const t = task ?? null;
    setActiveTask(t);
    setSeconds(0);
    setTimerState("running");
    localStorage.setItem(LS_STATE,  "running");
    localStorage.setItem(LS_KEY,    "0");
    localStorage.setItem(LS_START,  String(Date.now()));
    if (t) localStorage.setItem(LS_TASK, JSON.stringify(t));
    else   localStorage.removeItem(LS_TASK);
  }, []);

  const pause = useCallback(() => {
    setTimerState("paused");
    localStorage.setItem(LS_STATE, "paused");
    localStorage.removeItem(LS_START);
  }, []);

  const resume = useCallback(() => {
    setTimerState("running");
    localStorage.setItem(LS_STATE, "running");
    localStorage.setItem(LS_START, String(Date.now()));
  }, []);

  const stop = useCallback(() => {
    setTimerState("idle");
    setSeconds(0);
    setActiveTask(null);
    localStorage.removeItem(LS_STATE);
    localStorage.removeItem(LS_KEY);
    localStorage.removeItem(LS_TASK);
    localStorage.removeItem(LS_START);
  }, []);

  // ── Formatters ──────────────────────────────────────────────────────────────
  const formatTime = useCallback((s: number) => {
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${sec}`;
  }, []);

  const formatShort = useCallback((s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }, []);

  return (
    <FocusTimerContext.Provider
      value={{ timerState, seconds, activeTask, start, pause, resume, stop, formatTime, formatShort }}
    >
      {children}
    </FocusTimerContext.Provider>
  );
}
