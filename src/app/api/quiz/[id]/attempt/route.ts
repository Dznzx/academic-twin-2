export const dynamic = "force-dynamic";
// src/app/api/quiz/[id]/attempt/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { answers, timeTaken } = body; // answers: Array<{ questionId, answer }>

    const quiz = await prisma.quiz.findFirst({
      where: { id: params.id },
      include: { questions: true },
    });
    if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

    // Grade answers
    let score = 0;
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const gradedAnswers = quiz.questions.map((question) => {
      const userAnswer = answers.find((a: any) => a.questionId === question.id);
      const isCorrect =
        userAnswer?.answer?.trim().toLowerCase() ===
        question.correctAnswer.trim().toLowerCase();
      if (isCorrect) score += question.points;
      return {
        questionId: question.id,
        answer: userAnswer?.answer ?? "",
        isCorrect,
      };
    });

    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        quizId: quiz.id,
        score,
        totalPoints,
        percentage,
        timeTaken,
        answers: {
          create: gradedAnswers,
        },
      },
      include: { answers: true },
    });

    // Update analytics
    const prevAnalytics = await prisma.userAnalytics.findUnique({
      where: { userId: user.id },
    });
    const newAvg = prevAnalytics
      ? (prevAnalytics.avgQuizScore * prevAnalytics.quizzesCompleted + percentage) /
        (prevAnalytics.quizzesCompleted + 1)
      : percentage;

    await prisma.userAnalytics.upsert({
      where: { userId: user.id },
      create: { userId: user.id, quizzesCompleted: 1, avgQuizScore: percentage },
      update: {
        quizzesCompleted: { increment: 1 },
        avgQuizScore: newAvg,
      },
    });

    return NextResponse.json({
      data: { ...attempt, score, totalPoints, percentage, gradedAnswers },
    });
  } catch (error) {
    console.error("[POST /api/quiz/:id/attempt]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
