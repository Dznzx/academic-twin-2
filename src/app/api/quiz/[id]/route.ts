export const dynamic = "force-dynamic";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const quiz = await prisma.quiz.findFirst({
      where: { id: params.id, document: { userId: user.id } },
      include: {
        questions: { orderBy: { id: "asc" } },
        document: { select: { title: true } },
      },
    });

    if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

    return NextResponse.json({ data: quiz });
  } catch (error) {
    console.error("[GET /api/quiz/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
