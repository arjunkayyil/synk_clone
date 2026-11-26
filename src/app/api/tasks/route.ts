import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/tasks  — list tasks with optional filters (requires auth)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const projectId  = searchParams.get("projectId")  || undefined;
  const status     = searchParams.get("status")     || undefined;
  const type       = searchParams.get("type")       || undefined;
  const assigneeId = searchParams.get("assigneeId") || undefined;
  const q          = searchParams.get("q")          || undefined;

  const tasks = await prisma.task.findMany({
    where: {
      ...(projectId  ? { projectId }                                    : {}),
      ...(status && status !== "ALL"     ? { status }                   : {}),
      ...(type   && type   !== "ALL"     ? { type }                     : {}),
      ...(assigneeId && assigneeId !== "ALL" ? { assigneeId }           : {}),
      ...(q ? { title: { contains: q } }                                : {}),
    },
    include: {
      project:  true,
      assignee: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tasks);
}

// POST /api/tasks  — create a new task (requires auth)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as {
    projectId:   string;
    type:        string;
    priority?:   string;
    title:       string;
    description?: string;
    status?:     string;
    assigneeId?: string | null;
  };

  const { projectId, type, title, description, assigneeId } = body;
  const priority = body.priority ?? "P2";
  const status   = body.status   ?? "NEW";

  // Auto-increment number within the project
  const last = await prisma.task.findFirst({
    where:   { projectId },
    orderBy: { number: "desc" },
  });
  const number = (last?.number ?? 0) + 1;

  const task = await prisma.task.create({
    data: {
      projectId,
      number,
      type,
      priority,
      title,
      description: description ?? null,
      status,
      assigneeId:  assigneeId || null,
    },
    include: {
      project:  true,
      assignee: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(task, { status: 201 });
}
