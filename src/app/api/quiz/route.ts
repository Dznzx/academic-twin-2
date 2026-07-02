export const dynamic = "force-dynamic";
// src/app/api/quiz/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { generateQuiz } from "@/lib/ai/quiz-generator";

// POST /api/quiz — generate a quiz from a document
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { documentId, difficulty = "MEDIUM", questionCount = 10, types } = body;

    if (!documentId) {
      return NextResponse.json({ error: "documentId is required" }, { status: 400 });
    }

    // Verify ownership
    const document = await prisma.document.findFirst({
      where: { id: documentId, userId: user.id, status: "READY" },
      include: { chunks: { take: 20, orderBy: { chunkIndex: "asc" } } },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found or not ready" }, { status: 404 });
    }

    const content = document.chunks.map((c) => c.content).join("\n\n");

    // Generate questions with AI
    const questions = await generateQuiz({
      content,
      documentTitle: document.title,
      difficulty,
      questionCount,
      types,
    });

    // Save quiz to DB
    const quiz = await prisma.quiz.create({
      data: {
        documentId: document.id,
        title: `${document.title} — ${difficulty} Quiz`,
        difficulty,
        questions: {
          create: questions.map((q) => ({
            type: q.type,
            question: q.question,
            options: q.options ?? [],
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            points: q.points ?? 1,
          })),
        },
      },
      include: { questions: true },
    });

    return NextResponse.json({ data: quiz }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/quiz]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/quiz — list quizzes for user
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const quizzes = await prisma.quiz.findMany({
      where: { document: { userId: user.id } },
      include: {
        document: { select: { title: true } },
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: quizzes });
  } catch (error) {
    console.error("[GET /api/quiz]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
