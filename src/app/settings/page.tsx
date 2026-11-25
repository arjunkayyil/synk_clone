"use client";

/**
 * src/app/settings/page.tsx
 * Settings page mirroring Synk's Settings view:
 * Left tabs: Profile, Appearance, Security, Notifications, Integrations.
 * Right panels: Profile details, Notifications toggles.
 */

import { useState } from "react";
import { User, Palette, ShieldCheck, Bell, Network, Check, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme/ThemeProvider";

type TabKey = "profile" | "appearance" | "security" | "notifications" | "integrations";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const { theme, setTheme } = useTheme();

  // Profile form state
  const [displayName, setDisplayName] = useState("arjunkayyil");
  const [email] = useState("arjunkayyil@gmail.com");
  const [role] = useState("Member");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Notifications toggles state
  const [itemAssigned, setItemAssigned] = useState(true);
  const [commentOnItem, setCommentOnItem] = useState(true);
  const [statusChanged, setStatusChanged] = useState(true);

  const [contentReminders, setContentReminders] = useState(true);
  const [meetingReminders, setMeetingReminders] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [pushReminders, setPushReminders] = useState(true);

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Manage your account, preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8 items-start pt-2">
        {/* Left Nav */}
        <aside className="space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider px-3" style={{ color: "var(--text-muted)" }}>
            Account
          </p>
          <nav className="space-y-1">
            <TabBtn
              active={activeTab === "profile"}
              onClick={() => setActiveTab("profile")}
              icon={User}
              label="Profile"
            />
            <TabBtn
              active={activeTab === "appearance"}
              onClick={() => setActiveTab("appearance")}
              icon={Palette}
              label="Appearance"
            />
            <TabBtn
              active={activeTab === "security"}
              onClick={() => setActiveTab("security")}
              icon={ShieldCheck}
              label="Security"
            />
            <TabBtn
              active={activeTab === "notifications"}
              onClick={() => setActiveTab("notifications")}
              icon={Bell}
              label="Notifications"
            />
            <TabBtn
              active={activeTab === "integrations"}
              onClick={() => setActiveTab("integrations")}
              icon={Network}
              label="Integrations"
            />
          </nav>
        </aside>

        {/* Right Content Area */}
        <div className="space-y-6">
          {activeTab === "profile" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                  Profile
                </h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  How you appear to everyone else in the workspace.
                </p>
              </div>

              <div
                className="rounded-xl border p-6 space-y-6"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
              >
                <div>
                  <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                    Your details
                  </h3>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Your name and picture show on items, comments, and mentions.
                  </p>

                  <div className="flex items-center gap-3.5 mt-4">
                    <div className="w-12 h-12 rounded-full bg-slate-700/80 flex items-center justify-center font-semibold text-sm text-white">
                      A
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {displayName}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {email}
                      </p>
                    </div>
                  </div>
                </div>

                <hr style={{ borderColor: "var(--border)" }} />

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                      Display name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      className="w-full max-w-md px-3.5 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                      style={{ backgroundColor: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                        Email
                      </label>
                      <input
                        type="text"
                        disabled
                        value={email}
                        className="w-full px-3.5 py-2 rounded-lg text-sm outline-none opacity-80 cursor-not-allowed"
                        style={{ backgroundColor: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                        Role
                      </label>
                      <input
                        type="text"
                        disabled
                        value={role}
                        className="w-full px-3.5 py-2 rounded-lg text-sm outline-none opacity-80 cursor-not-allowed"
                        style={{ backgroundColor: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:bg-blue-600"
                      style={{ backgroundColor: "var(--accent)" }}
                    >
                      Save
                    </button>
                    {savedSuccess && (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <Check size={14} /> Saved successfully!
                      </span>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                  Notifications
                </h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Choose which events you get notified about and how.
                </p>
              </div>

              {/* Email notifications card */}
              <div
                className="rounded-xl border p-6 space-y-5"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
              >
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    Email notifications
                  </h3>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Sent to {email}
                  </p>
                </div>

                <div className="space-y-4 pt-1">
                  <ToggleRow
                    label="Item assigned to you"
                    checked={itemAssigned}
                    onChange={setItemAssigned}
                  />
                  <ToggleRow
                    label="Comment on your item"
                    checked={commentOnItem}
                    onChange={setCommentOnItem}
                  />
                  <ToggleRow
                    label="Status changed on your item"
                    checked={statusChanged}
                    onChange={setStatusChanged}
                  />
                </div>
              </div>

              {/* Reminders card */}
              <div
                className="rounded-xl border p-6 space-y-5"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
              >
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    Reminders
                  </h3>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Content, meetings, and task due-date reminders.
                  </p>
                </div>

                <div className="space-y-4 pt-1">
                  <ToggleRow
                    label="Email content reminders"
                    checked={contentReminders}
                    onChange={setContentReminders}
                  />
                  <ToggleRow
                    label="Email meeting reminders"
                    checked={meetingReminders}
                    onChange={setMeetingReminders}
                  />
                  <ToggleRow
                    label="Email task reminders"
                    checked={taskReminders}
                    onChange={setTaskReminders}
                  />
                  <ToggleRow
                    label="Push content reminders"
                    checked={pushReminders}
                    onChange={setPushReminders}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="rounded-xl border p-6 space-y-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Theme</h3>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Select your preferred interface color theme.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-sm pt-2">
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all cursor-pointer",
                    theme === "dark"
                      ? "border-blue-500 bg-blue-600/10"
                      : "border-(--border) hover:bg-(--bg-hover)"
                  )}
                >
                  <Moon size={22} className={theme === "dark" ? "text-blue-400" : "text-(--text-muted)"} />
                  <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Dark mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={cn(
                    "flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all cursor-pointer",
                    theme === "light"
                      ? "border-blue-500 bg-blue-600/10"
                      : "border-(--border) hover:bg-(--bg-hover)"
                  )}
                >
                  <Sun size={22} className={theme === "light" ? "text-blue-500" : "text-(--text-muted)"} />
                  <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Light mode</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="rounded-xl border p-6" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Security</h3>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Change password and session management.</p>
            </div>
          )}

          {activeTab === "integrations" && (
            <div className="rounded-xl border p-6" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Integrations</h3>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Connect GitHub, Slack, and webhook notifications.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ size: number; className?: string }>;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
        active
          ? "bg-blue-600/20 text-blue-300"
          : "text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-hover)"
      )}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer",
          checked ? "bg-blue-500 justify-end" : "bg-slate-700 justify-start"
        )}
      >
        <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
      </button>
    </div>
  );
}
