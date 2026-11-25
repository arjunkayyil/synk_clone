import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface ChatMessageInput {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    const messages: ChatMessageInput[] = body.messages;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    const userPrompt = (lastMessage.content || "").trim();
    const lowerPrompt = userPrompt.toLowerCase();

    // Fetch live workspace data from DB
    const [tasks, users, projects] = await Promise.all([
      prisma.task.findMany({
        include: { assignee: true, project: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.user.findMany(),
      prisma.project.findMany(),
    ]);

    const currentUserName = session?.user?.name || "arjunkayyil";
    const currentUserEmail = session?.user?.email || "arjunkayyil@gmail.com";

    // Check if user has an external GEMINI_API_KEY
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const workspaceContext = `
You are Nyx, the AI assistant inside Synk task management.
User: ${currentUserName} (${currentUserEmail})
Workspace projects: ${projects.map((p: { name: string; key: string }) => `${p.name} (${p.key})`).join(", ")}
Team members: ${users.map((u: { name: string }) => u.name).join(", ")}
Current tasks (${tasks.length} total):
${tasks.slice(0, 20).map((t: any) => `- [${t.project.key}-${t.type}-${t.number}] (${t.priority}, ${t.status}) "${t.title}" assigned to ${t.assignee?.name || "Unassigned"}`).join("\n")}
Answer concisely in markdown.
`;
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: `${workspaceContext}\n\nUser Question: ${userPrompt}` }],
                },
              ],
            }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return NextResponse.json({ reply });
          }
        }
      } catch (err) {
        console.warn("External Gemini API call failed, falling back to local NLP engine", err);
      }
    }

    // ── Local Intelligent Workspace NLP Engine ─────────────────────────────
    let reply = "";

    // 1. "My tasks" / "assigned to me"
    if (
      lowerPrompt.includes("my task") ||
      lowerPrompt.includes("assigned to me") ||
      lowerPrompt.includes("what am i working on") ||
      lowerPrompt.includes("my backlog")
    ) {
      const myTasks = tasks.filter(
        (t: any) =>
          t.assignee?.email?.toLowerCase() === currentUserEmail.toLowerCase() ||
          t.assignee?.name?.toLowerCase().includes("arjun")
      );

      if (myTasks.length === 0) {
        reply = `You currently have **0 active tasks** assigned to you in Lorb. You can pick up an unassigned bug from the Board or click **+ New item** to create one!`;
      } else {
        reply = `Here are the tasks currently assigned to you (**${myTasks.length}**):\n\n` +
          myTasks
            .map(
              (t: any) =>
                `• **${t.project.key}-${t.type}-${t.number}** (${t.status.replace("_", " ")} · ${t.priority}): ${t.title}`
            )
            .join("\n") +
          `\n\n💡 *Tip: Drag any card to "Work in hand" on the Work tab to start the focus timer.*`;
      }
    }
    // 2. "Active bugs" / "bugs overview"
    else if (
      lowerPrompt.includes("bug") &&
      (lowerPrompt.includes("active") || lowerPrompt.includes("overview") || lowerPrompt.includes("open") || lowerPrompt.includes("list"))
    ) {
      const activeBugs = tasks.filter((t: any) => t.type === "BUG" && (t.status === "NEW" || t.status === "IN_PROGRESS"));
      reply = `There are currently **${activeBugs.length} active bugs** in the workspace:\n\n` +
        activeBugs
          .slice(0, 6)
          .map(
            (b: any) =>
              `• **${b.project.key}-BUG-${b.number}** [${b.priority}]: ${b.title}\n  ↳ *Assignee:* ${b.assignee?.name || "Unassigned"} (${b.status === "IN_PROGRESS" ? "In progress" : "New"})`
          )
          .join("\n\n") +
        (activeBugs.length > 6 ? `\n\n*...and ${activeBugs.length - 6} more bugs on the Board.*` : "");
    }
    // 3. Questions about specific team members (Anooja, Arathi, Abhinav, etc.)
    else if (
      users.some((u: { name: string }) => lowerPrompt.includes(u.name.toLowerCase().split(" ")[0]))
    ) {
      const matchedUser = users.find((u: { name: string }) => lowerPrompt.includes(u.name.toLowerCase().split(" ")[0]))!;
      const userTasks = tasks.filter((t: any) => t.assigneeId === matchedUser.id || t.assignee?.name === matchedUser.name);
      if (userTasks.length === 0) {
        reply = `**${matchedUser.name}** currently has no assigned tasks in the backlog.`;
      } else {
        reply = `**${matchedUser.name}** has **${userTasks.length} task(s)** assigned:\n\n` +
          userTasks
            .map(
              (t: any) =>
                `• **${t.project.key}-${t.type}-${t.number}** (${t.status.replace("_", " ")}): ${t.title}`
            )
            .join("\n");
      }
    }
    // 4. "Team workload" / "who is working on what"
    else if (
      lowerPrompt.includes("team") ||
      lowerPrompt.includes("workload") ||
      lowerPrompt.includes("members")
    ) {
      const workloadMap: Record<string, number> = {};
      for (const u of users) workloadMap[u.name] = 0;
      for (const t of tasks as any[]) {
        if (t.assignee?.name) {
          workloadMap[t.assignee.name] = (workloadMap[t.assignee.name] || 0) + 1;
        }
      }
      const topMembers = Object.entries(workloadMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

      reply = `📊 **Team Workload Summary (${tasks.length} total tasks):**\n\n` +
        topMembers
          .map(([name, count]) => `• **${name}**: ${count} task${count === 1 ? "" : "s"}`)
          .join("\n") +
        `\n\n• **Unassigned backlog items**: ${tasks.filter((t: any) => !t.assigneeId).length}`;
    }
    // 5. "Draft bug" / "report bug"
    else if (lowerPrompt.includes("draft") || lowerPrompt.includes("template") || (lowerPrompt.includes("create") && lowerPrompt.includes("bug"))) {
      reply = `Here is a structured bug report draft for you:\n\n` +
        `**Title:** [Module] Brief summary of the bug\n` +
        `**Severity:** High / Medium\n` +
        `**Environment:** Production / QA / Staging\n` +
        `**Steps to Reproduce:**\n` +
        `1. Navigate to the page\n` +
        `2. Trigger action X\n` +
        `3. Observe unexpected failure\n\n` +
        `**Expected Result:** Action completes successfully.\n` +
        `**Actual Result:** Error message is shown.\n\n` +
        `Click **+ New item** at the top right to submit this bug!`;
    }
    // 6. Project summary / stats
    else if (lowerPrompt.includes("project") || lowerPrompt.includes("status") || lowerPrompt.includes("summary")) {
      const openCount = tasks.filter((t: any) => t.status === "NEW").length;
      const progressCount = tasks.filter((t: any) => t.status === "IN_PROGRESS").length;
      const doneCount = tasks.filter((t: any) => t.status === "FIXED" || t.status === "CLOSED").length;

      reply = `🚀 **Workspace Summary: Lorb (LB)**\n\n` +
        `• **Total tasks:** ${tasks.length}\n` +
        `• **Open / Backlog:** ${openCount}\n` +
        `• **In Progress:** ${progressCount}\n` +
        `• **Fixed / Done:** ${doneCount}\n` +
        `• **Team Members:** ${users.length}\n\n` +
        `Let me know if you would like me to inspect any specific bug or assignee!`;
    }
    // 7. Greetings
    else if (lowerPrompt.includes("hello") || lowerPrompt.includes("hi") || lowerPrompt.includes("hey")) {
      reply = `Hello ${currentUserName}! 👋 I'm **Nyx**, your workspace AI assistant. How can I help you with your tasks or bugs today?`;
    }
    // 8. General fallback with context awareness
    else {
      reply = `I analyzed your request in the context of the **Lorb** workspace (${tasks.length} tasks, ${users.length} team members).\n\n` +
        `You asked: *"${userPrompt}"*\n\n` +
        `Here are a few things I can assist you with:\n` +
        `• Check your assigned tasks ("What are my tasks?")\n` +
        `• Show active bugs or high priority issues ("Active bugs overview")\n` +
        `• Check team member workload ("What is Anooja working on?")\n` +
        `• Help draft a bug report template ("Draft a bug report")`;
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Nyx chat error:", error);
    return NextResponse.json(
      { reply: "Sorry, I encountered an error accessing workspace data. Please try again in a moment." },
      { status: 500 }
    );
  }
}
