import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/users  — list all users (for assignee dropdowns)
export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(users);
}
