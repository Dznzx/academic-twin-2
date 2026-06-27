// src/app/api/study-planner/tasks/[id]/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { status } = body;

    // Verify task belongs to user
    const task = await prisma.studyTask.findFirst({
      where: { id: params.id, plan: { userId: user.id } },
    });
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const updated = await prisma.studyTask.update({
      where: { id: params.id },
      data: { status },
    });

    // Track study time when task is completed
    if (status === "COMPLETED" && task.status !== "COMPLETED") {
      await prisma.userAnalytics.upsert({
        where: { userId: user.id },
        create: { userId: user.id, totalStudyTime: task.duration },
        update: { totalStudyTime: { increment: task.duration } },
      });
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[PATCH /api/study-planner/tasks/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
