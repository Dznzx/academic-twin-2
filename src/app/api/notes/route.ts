import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { generateNotes, NoteStyle } from "@/lib/ai/notes-generator";

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const notes = await prisma.note.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: notes });
  } catch (error) {
    console.error("[GET /api/notes]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { topic, style = "OUTLINE", documentId } = body as {
      topic: string;
      style: NoteStyle;
      documentId?: string;
    };

    if (!topic?.trim()) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    let content = "";
    let title = topic.trim();

    if (documentId) {
      const document = await prisma.document.findFirst({
        where: { id: documentId, userId: user.id, status: "READY" },
        include: { chunks: { take: 20, orderBy: { chunkIndex: "asc" } } },
      });

      if (!document) {
        return NextResponse.json({ error: "Document not found or not ready" }, { status: 404 });
      }

      content = document.chunks.map((c) => c.content).join("\n\n");
      title = `${document.title} — ${topic.trim()}`;
    }

    const notesContent = await generateNotes({ content, topic: topic.trim(), style });

    const note = await prisma.note.create({
      data: {
        userId: user.id,
        documentId: documentId ?? null,
        title,
        topic: topic.trim(),
        style,
        content: notesContent,
      },
    });

    return NextResponse.json({ data: note }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/notes]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
