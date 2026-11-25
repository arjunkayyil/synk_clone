import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/projects  — list all projects
export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(projects);
}
