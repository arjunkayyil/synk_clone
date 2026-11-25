/**
 * src/components/layout/RightPanel.tsx
 * The right "Work in hand" panel with tabs: Work / Space / Nyx.
 * Currently shows a placeholder. Task drag-and-drop will be wired up later.
 */
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Hand, Globe, Sparkles } from "lucide-react";

const tabs = [
  { label: "Work",  icon: Hand },
  { label: "Space", icon: Globe },
  { label: "Nyx",   icon: Sparkles },
];

export function RightPanel() {
  const [activeTab, setActiveTab] = useState("Work");

  return (
    <aside
      className="w-64 flex flex-col shrink-0 border-l"
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
              "flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
              activeTab === label
                ? "text-blue-400 border-b-2 border-blue-500"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Panel body */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === "Work" && <WorkPanel />}
        {activeTab === "Space" && (
          <EmptyState message="Your workspace notes and links will appear here." />
        )}
        {activeTab === "Nyx" && (
          <EmptyState message="AI assistant — Nyx will help you here soon." />
        )}
      </div>
    </aside>
  );
}

function WorkPanel() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        Work in hand
      </p>
      <div
        className="rounded-lg border-2 border-dashed p-4 text-center text-xs"
        style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
      >
        <Hand size={24} className="mx-auto mb-2 opacity-30" />
        Drag a task here to claim it and start the timer.
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-xs text-center mt-8" style={{ color: "var(--text-muted)" }}>
      {message}
    </p>
  );
}
