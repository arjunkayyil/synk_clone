/**
 * src/components/layout/Sidebar.tsx
 * Left sidebar navigation with links to Dashboard, Tasks, Board, etc.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListTodo,
  Columns3,
  Table2,
  Calendar,
  FolderKanban,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard",  href: "/",          icon: LayoutDashboard },
  { label: "Tasks",      href: "/tasks",      icon: ListTodo },
  { label: "Board",      href: "/board",      icon: Columns3 },
  { label: "Table",      href: "/table",      icon: Table2 },
  { label: "Calendar",   href: "/calendar",   icon: Calendar },
  { label: "Projects",   href: "/projects",   icon: FolderKanban },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-14 flex flex-col items-center py-3 gap-1 border-r shrink-0"
      style={{
        backgroundColor: "var(--bg-panel)",
        borderColor: "var(--border)",
      }}
    >
      {navItems.map(({ label, href, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            title={label}
            className={cn(
              "w-9 h-9 flex items-center justify-center rounded-lg transition-colors",
              active
                ? "bg-blue-600 text-white"
                : "text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-hover)"
            )}
          >
            <Icon size={18} />
          </Link>
        );
      })}

      <div className="flex-1" />

      <Link
        href="/settings"
        title="Settings"
        className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-hover)"
      >
        <Settings size={18} />
      </Link>
    </aside>
  );
}
