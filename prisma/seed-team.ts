import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱  Seeding team members and Synk tasks...");

  const password = await bcrypt.hash("password123", 10);

  // 1. Team members from Synk screenshot
  const teamMembers = [
    { name: "arjunkayyil",       email: "arjunkayyil@gmail.com" },
    { name: "Abhinav K",         email: "abhinav@synk.dev" },
    { name: "Adhil Roshan",      email: "adhil@synk.dev" },
    { name: "Admin",             email: "admin@synk.dev" },
    { name: "Anooja C K",        email: "anooja@synk.dev" },
    { name: "Arathi V",          email: "arathi@synk.dev" },
    { name: "Fathima Manal",     email: "fathima@synk.dev" },
    { name: "Krishna M R",       email: "krishna@synk.dev" },
    { name: "nibinkuzhikkattil", email: "nibin@synk.dev" },
    { name: "nihal",             email: "nihal@synk.dev" },
    { name: "Niyas M T",         email: "niyas@synk.dev" },
    { name: "Alice Chen",        email: "alice@synk.dev" },
    { name: "Bob Ray",           email: "bob@synk.dev" },
    { name: "Carol Singh",       email: "carol@synk.dev" },
  ];

  const userMap: Record<string, string> = {};

  for (const member of teamMembers) {
    const user = await prisma.user.upsert({
      where: { email: member.email },
      update: { name: member.name },
      create: {
        name: member.name,
        email: member.email,
        passwordHash: password,
      },
    });
    userMap[member.name] = user.id;
  }

  // 2. Project
  const project = await prisma.project.upsert({
    where: { key: "LB" },
    update: { name: "Lorb" },
    create: { name: "Lorb", key: "LB" },
  });

  // 3. Clear existing tasks in project to make sure our clean task list is fresh
  await prisma.task.deleteMany({
    where: { projectId: project.id },
  });

  // 4. Create tasks matching Synk screenshots
  const tasksToCreate = [
    // Open / New tasks (unassigned & assigned)
    {
      number: 1086,
      type: "BUG",
      priority: "P2",
      title: 'Clicking "Join" on a STARTED LORB Meet live class fails with "Failed to join live class. Please try again."',
      description: "Live class join fails intermittently on student portal.",
      status: "NEW",
      assigneeName: undefined,
      daysAgo: 0,
    },
    {
      number: 1084,
      type: "BUG",
      priority: "P2",
      title: "[Finance]Applying a discount fails during initial fee configuration setup before committing",
      description: "Discount rule does not apply when fee is created.",
      status: "NEW",
      assigneeName: undefined,
      daysAgo: 0,
    },
    {
      number: 1083,
      type: "BUG",
      priority: "P2",
      title: 'New Meeting - "Who can join" selection closes the meeting creation',
      description: "Dropdown click closes modal unexpectedly.",
      status: "NEW",
      assigneeName: undefined,
      daysAgo: 1,
    },
    {
      number: 1087,
      type: "BUG",
      priority: "P2",
      title: "[Student panel] Student Is Redirected to dev.lorb.in Instead of dashboard",
      description: "Redirect url after authentication uses dev host.",
      status: "NEW",
      assigneeName: undefined,
      daysAgo: 0,
    },
    {
      number: 1082,
      type: "TASK",
      priority: "P1",
      title: "Sync batch timetable cache on cron trigger",
      description: "Performance improvements for timetable lookup.",
      status: "NEW",
      assigneeName: "Abhinav K",
      daysAgo: 2,
    },
    {
      number: 1081,
      type: "STORY",
      priority: "P3",
      title: "Parent portal notifications for exam publish",
      description: "Push notifications via FCM.",
      status: "NEW",
      assigneeName: "Fathima Manal",
      daysAgo: 3,
    },

    // Active / In Progress tasks
    {
      number: 1079,
      type: "BUG",
      priority: "P2",
      title: "Unable to select date and time when scheduling a meeting",
      description: "Timepicker popup is clipped in modal.",
      status: "IN_PROGRESS",
      assigneeName: "arjunkayyil",
      daysAgo: 0,
    },
    {
      number: 1058,
      type: "BUG",
      priority: "P2",
      title: "[Activities]Incorrect Submission Status Calculation Based on Grade",
      description: "Grade calculation rounding error.",
      status: "IN_PROGRESS",
      assigneeName: "arjunkayyil",
      daysAgo: 0,
    },
    {
      number: 926,
      type: "BUG",
      priority: "P2",
      title: 'Attendance Rate summary card displays an irrelevant "0 pending payments" subtitle',
      description: "Wrong subtitle string referenced in template.",
      status: "IN_PROGRESS",
      assigneeName: "Anooja C K",
      daysAgo: 1,
    },
    {
      number: 977,
      type: "BUG",
      priority: "P2",
      title: "Subject Teachers Cannot Access Attendance Analytics or Filter by Assigned Subjects",
      description: "RBAC check prevents read access to teacher role.",
      status: "IN_PROGRESS",
      assigneeName: "Anooja C K",
      daysAgo: 2,
    },
    {
      number: 1012,
      type: "TASK",
      priority: "P2",
      title: "Refactor PDF generation for student term report card",
      description: "Use React PDF server-side renderer.",
      status: "IN_PROGRESS",
      assigneeName: "Adhil Roshan",
      daysAgo: 3,
    },
    {
      number: 1015,
      type: "STORY",
      priority: "P1",
      title: "Attendance punch-in geofencing verification",
      description: "Check GPS coords with school boundary.",
      status: "IN_PROGRESS",
      assigneeName: "Krishna M R",
      daysAgo: 4,
    },

    // Done / Fixed tasks
    {
      number: 928,
      type: "BUG",
      priority: "P2",
      title: "Delay in Saving Timetable Changes.",
      description: "Optimistic updates needed for batch schedule updates.",
      status: "FIXED",
      assigneeName: "Anooja C K",
      daysAgo: 5,
    },
    {
      number: 946,
      type: "BUG",
      priority: "P2",
      title: "[Syllabus]Asymmetric syllabus archiving permissions and institutional wide syllabus visibility leak for teachers",
      description: "Added tenant and department scoping to syllabus query.",
      status: "FIXED",
      assigneeName: "Arathi V",
      daysAgo: 6,
    },
    {
      number: 895,
      type: "BUG",
      priority: "P2",
      title: "[Attendance]Inconsistent Display of Subject and Teacher Details in Monthly Attendance History.",
      description: "Populate teacher join on monthly log query.",
      status: "FIXED",
      assigneeName: "Arathi V",
      daysAgo: 7,
    },
    {
      number: 910,
      type: "TASK",
      priority: "P1",
      title: "Upgrade Prisma client and add DB connection pool tuning",
      description: "Reduced connection latency in production.",
      status: "FIXED",
      assigneeName: "nibinkuzhikkattil",
      daysAgo: 10,
    },
    {
      number: 902,
      type: "STORY",
      priority: "P2",
      title: "Automated daily SMS report for absent students",
      description: "Scheduled SMS via Twilio integration.",
      status: "CLOSED",
      assigneeName: "nihal",
      daysAgo: 14,
    },
    {
      number: 880,
      type: "TASK",
      priority: "P3",
      title: "Export library book issue records to Excel and CSV",
      description: "Implemented sheetjs export hook.",
      status: "CLOSED",
      assigneeName: "Niyas M T",
      daysAgo: 20,
    },
  ];

  for (const item of tasksToCreate) {
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - item.daysAgo);

    await prisma.task.create({
      data: {
        projectId: project.id,
        number: item.number,
        type: item.type,
        priority: item.priority,
        title: item.title,
        description: item.description,
        status: item.status,
        assigneeId: item.assigneeName ? userMap[item.assigneeName] : null,
        createdAt: createdDate,
        updatedAt: createdDate,
      },
    });
  }

  console.log(`✅ Successfully seeded ${teamMembers.length} users and ${tasksToCreate.length} tasks!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
