// src/app/api/study-planner/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { openai } from "@/lib/ai/openai";

// GET — list study plans for user
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const plans = await prisma.studyPlan.findMany({
      where: { userId: user.id },
      include: { tasks: { orderBy: { dueDate: "asc" } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: plans });
  } catch (error) {
    console.error("[GET /api/study-planner]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — create a new study plan (manual or AI-generated)
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { title, startDate, endDate, tasks, generateWithAI, subjects, examDate } = body;

    let finalTasks = tasks ?? [];

    // AI-generated plan
    if (generateWithAI && subjects) {
      const analytics = await prisma.userAnalytics.findUnique({
        where: { userId: user.id },
        include: { weakTopics: true },
      });

      const weakTopicsStr = analytics?.weakTopics.map((t) => t.topic).join(", ") ?? "none identified yet";

      const prompt = `You are an expert academic study planner.

Create a study plan from ${startDate} to ${examDate ?? endDate}.
Subjects to cover: ${subjects}
Known weak topics: ${weakTopicsStr}
Average quiz score: ${Math.round(analytics?.avgQuizScore ?? 0)}%

Generate a realistic daily study schedule. Each task should be specific and actionable.

Respond ONLY with a JSON array of tasks:
[
  {
    "title": "Review Neural Networks — Backpropagation",
    "description": "Focus on chain rule and gradient flow",
    "dueDate": "2024-06-01T09:00:00Z",
    "duration": 45,
    "priority": "HIGH",
    "subject": "Machine Learning"
  }
]

Return ONLY the JSON array.`;

      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL ?? "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      try {
        const parsed = JSON.parse(response.choices[0].message.content ?? "{}");
        finalTasks = Array.isArray(parsed) ? parsed : parsed.tasks ?? [];
      } catch {
        finalTasks = [];
      }
    }

    const plan = await prisma.studyPlan.create({
      data: {
        userId: user.id,
        title: title ?? "My Study Plan",
        startDate: new Date(startDate),
        endDate: new Date(endDate ?? examDate),
        tasks: {
          create: finalTasks.map((t: any) => ({
            title: t.title,
            description: t.description,
            dueDate: new Date(t.dueDate),
            duration: t.duration ?? 30,
            priority: t.priority ?? "MEDIUM",
            status: "PENDING",
            subject: t.subject,
          })),
        },
      },
      include: { tasks: { orderBy: { dueDate: "asc" } } },
    });

    return NextResponse.json({ data: plan }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/study-planner]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
