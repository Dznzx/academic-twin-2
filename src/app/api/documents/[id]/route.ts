export const dynamic = "force-dynamic";
// src/app/api/documents/[id]/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { deleteDocumentVectors } from "@/lib/ai/pinecone";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const document = await prisma.document.findFirst({
      where: { id: params.id, userId: user.id },
      include: { _count: { select: { chunks: true, quizzes: true, flashcardSets: true } } },
    });

    if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 });

    return NextResponse.json({ data: document });
  } catch (error) {
    console.error("[GET /api/documents/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const document = await prisma.document.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 });

    // Delete from vector DB
    await deleteDocumentVectors(document.id, user.id);

    // Delete from Postgres (cascades to chunks, quizzes, flashcards)
    await prisma.document.delete({ where: { id: document.id } });

    return NextResponse.json({ message: "Document deleted" });
  } catch (error) {
    console.error("[DELETE /api/documents/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
