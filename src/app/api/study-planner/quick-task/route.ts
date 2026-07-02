export const dynamic = "force-dynamic";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// POST — quick add a single task (auto-creates a default plan if needed)
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { title, description, dueDate, priority = "MEDIUM" } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Get or create a default "Quick Tasks" plan
    let plan = await prisma.studyPlan.findFirst({
      where: { userId: user.id, title: "Quick Tasks" },
    });

    if (!plan) {
      plan = await prisma.studyPlan.create({
        data: {
          userId: user.id,
          title: "Quick Tasks",
          startDate: new Date(),
          endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
        },
      });
    }

    const task = await prisma.studyTask.create({
      data: {
        planId: plan.id,
        title: title.trim(),
        description: description?.trim() || null,
        dueDate: dueDate ? new Date(dueDate) : new Date(),
        duration: 30,
        priority,
        status: "PENDING",
      },
    });

    return NextResponse.json({ data: task }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/study-planner/quick-task]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
