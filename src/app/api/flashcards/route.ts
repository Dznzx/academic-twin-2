export const dynamic = "force-dynamic";
// src/app/api/flashcards/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { generateFlashcards } from "@/lib/ai/flashcard-generator";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { documentId, count = 20 } = body;

    const document = await prisma.document.findFirst({
      where: { id: documentId, userId: user.id, status: "READY" },
      include: { chunks: { take: 15, orderBy: { chunkIndex: "asc" } } },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found or not ready" }, { status: 404 });
    }

    const content = document.chunks.map((c) => c.content).join("\n\n");
    const cards = await generateFlashcards({ content, documentTitle: document.title, count });

    const set = await prisma.flashcardSet.create({
      data: {
        userId: user.id,
        documentId: document.id,
        title: `${document.title} — Flashcards`,
        cards: {
          create: cards.map((card) => ({
            front: card.front,
            back: card.back,
          })),
        },
      },
      include: { cards: true },
    });

    return NextResponse.json({ data: set }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/flashcards]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const sets = await prisma.flashcardSet.findMany({
      where: { userId: user.id },
      include: {
        document: { select: { title: true } },
        _count: { select: { cards: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: sets });
  } catch (error) {
    console.error("[GET /api/flashcards]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
