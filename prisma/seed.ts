/**
 * prisma/seed.ts
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
 * Or via: npx prisma db seed
 *
 * Creates: 3 users, 1 project (key=LB), ~30 tasks with varied types/status/priority.
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱  Seeding database...");

  // ── Users ────────────────────────────────────────────────────────────────
  const password = await bcrypt.hash("password123", 10);

  const alice = await prisma.user.upsert({
    where: { email: "alice@synk.dev" },
    update: {},
    create: { name: "Alice Chen", email: "alice@synk.dev", passwordHash: password },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@synk.dev" },
    update: {},
    create: { name: "Bob Ray", email: "bob@synk.dev", passwordHash: password },
  });

  const carol = await prisma.user.upsert({
    where: { email: "carol@synk.dev" },
    update: {},
    create: { name: "Carol Singh", email: "carol@synk.dev", passwordHash: password },
  });

  // ── Project ───────────────────────────────────────────────────────────────
  const project = await prisma.project.upsert({
    where: { key: "LB" },
    update: {},
    create: { name: "Launchbase", key: "LB" },
  });

  // ── Tasks ─────────────────────────────────────────────────────────────────
  const taskData: Array<{
    number: number;
    type: string;
    priority: string;
    title: string;
    description?: string;
    status: string;
    assigneeId?: string;
    daysAgo: number;
  }> = [
    { number: 1,  type: "TASK",  priority: "P1", title: "Setup CI/CD pipeline",              status: "CLOSED",      assigneeId: alice.id,  daysAgo: 20 },
    { number: 2,  type: "BUG",   priority: "P1", title: "Login page crashes on mobile",       status: "FIXED",       assigneeId: bob.id,    daysAgo: 18 },
    { number: 3,  type: "STORY", priority: "P2", title: "User onboarding flow",               status: "IN_PROGRESS", assigneeId: carol.id,  daysAgo: 15 },
    { number: 4,  type: "TASK",  priority: "P2", title: "Design system tokens",               status: "FIXED",       assigneeId: alice.id,  daysAgo: 14 },
    { number: 5,  type: "BUG",   priority: "P2", title: "Dashboard flickers on load",         status: "IN_PROGRESS", assigneeId: bob.id,    daysAgo: 12 },
    { number: 6,  type: "TASK",  priority: "P3", title: "Write API documentation",            status: "NEW",                                 daysAgo: 11 },
    { number: 7,  type: "STORY", priority: "P1", title: "Implement drag-and-drop board",      status: "IN_PROGRESS", assigneeId: alice.id,  daysAgo: 10 },
    { number: 8,  type: "BUG",   priority: "P1", title: "Timer resets on page refresh",       status: "NEW",         assigneeId: carol.id,  daysAgo: 9  },
    { number: 9,  type: "TASK",  priority: "P2", title: "Add dark mode support",              status: "CLOSED",      assigneeId: bob.id,    daysAgo: 9  },
    { number: 10, type: "STORY", priority: "P3", title: "Notification system",                status: "NEW",                                 daysAgo: 8  },
    { number: 11, type: "BUG",   priority: "P2", title: "Comments not loading on slow conn.", status: "NEW",         assigneeId: alice.id,  daysAgo: 8  },
    { number: 12, type: "TASK",  priority: "P1", title: "Database query optimisation",        status: "IN_PROGRESS", assigneeId: carol.id,  daysAgo: 7  },
    { number: 13, type: "BUG",   priority: "P3", title: "Tooltip overlaps sidebar",           status: "FIXED",       assigneeId: bob.id,    daysAgo: 7  },
    { number: 14, type: "STORY", priority: "P2", title: "Project calendar view",              status: "NEW",                                 daysAgo: 6  },
    { number: 15, type: "TASK",  priority: "P2", title: "Migrate auth to Auth.js",            status: "FIXED",       assigneeId: alice.id,  daysAgo: 6  },
    { number: 16, type: "BUG",   priority: "P1", title: "Session expires too early",          status: "IN_PROGRESS", assigneeId: carol.id,  daysAgo: 5  },
    { number: 17, type: "TASK",  priority: "P3", title: "Add export to CSV feature",          status: "NEW",                                 daysAgo: 5  },
    { number: 18, type: "STORY", priority: "P1", title: "Real-time collaboration",            status: "NEW",         assigneeId: bob.id,    daysAgo: 4  },
    { number: 19, type: "BUG",   priority: "P2", title: "Search returns stale results",       status: "NEW",         assigneeId: alice.id,  daysAgo: 4  },
    { number: 20, type: "TASK",  priority: "P1", title: "Setup Prisma with PostgreSQL",       status: "FIXED",       assigneeId: carol.id,  daysAgo: 3  },
    { number: 21, type: "BUG",   priority: "P3", title: "Date picker shows wrong timezone",   status: "NEW",                                 daysAgo: 3  },
    { number: 22, type: "STORY", priority: "P2", title: "Task comments with mentions",        status: "IN_PROGRESS", assigneeId: alice.id,  daysAgo: 3  },
    { number: 23, type: "TASK",  priority: "P2", title: "Implement pagination",               status: "NEW",         assigneeId: bob.id,    daysAgo: 2  },
    { number: 24, type: "BUG",   priority: "P1", title: "Board drag leaves ghost card",       status: "IN_PROGRESS", assigneeId: carol.id,  daysAgo: 2  },
    { number: 25, type: "TASK",  priority: "P3", title: "Add keyboard shortcuts",             status: "NEW",                                 daysAgo: 2  },
    { number: 26, type: "STORY", priority: "P1", title: "Time tracking reports",              status: "NEW",         assigneeId: alice.id,  daysAgo: 1  },
    { number: 27, type: "BUG",   priority: "P2", title: "Avatar upload fails on Firefox",     status: "NEW",         assigneeId: bob.id,    daysAgo: 1  },
    { number: 28, type: "TASK",  priority: "P1", title: "Security audit and pen testing",     status: "IN_PROGRESS", assigneeId: carol.id,  daysAgo: 1  },
    { number: 29, type: "STORY", priority: "P3", title: "Mobile responsive layout",           status: "NEW",                                 daysAgo: 0  },
    { number: 30, type: "BUG",   priority: "P2", title: "Filter state lost on navigation",    status: "NEW",         assigneeId: alice.id,  daysAgo: 0  },
  ];

  for (const t of taskData) {
    const created = new Date();
    created.setDate(created.getDate() - t.daysAgo);

    await prisma.task.upsert({
      where: { projectId_number: { projectId: project.id, number: t.number } },
      update: {},
      create: {
        projectId:   project.id,
        number:      t.number,
        type:        t.type,
        priority:    t.priority,
        title:       t.title,
        description: t.description ?? `Detailed description for: ${t.title}`,
        status:      t.status,
        assigneeId:  t.assigneeId,
        createdAt:   created,
        updatedAt:   created,
      },
    });
  }

  console.log(
    `✅  Seeded: 3 users, 1 project (LB), ${taskData.length} tasks`
  );
  console.log("   Login: alice@synk.dev / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
