export const dynamic = "force-dynamic";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const analytics = await prisma.userAnalytics.findUnique({
      where: { userId: user.id },
      include: {
        weakTopics: { orderBy: { score: "asc" }, take: 5 },
      },
    });

    const recentAttempts = await prisma.quizAttempt.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: "desc" },
      take: 20,
      include: { quiz: { select: { title: true, difficulty: true } } },
    });

    const subjectPerformance = await prisma.quizAttempt.groupBy({
      by: ["quizId"],
      where: { userId: user.id },
      _avg: { percentage: true },
    });

    return NextResponse.json({
      data: {
        ...analytics,
        recentAttempts,
        subjectPerformance,
      },
    });
  } catch (error) {
    console.error("[GET /api/analytics]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
