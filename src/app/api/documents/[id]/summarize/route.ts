export const dynamic = "force-dynamic";
// src/app/api/documents/[id]/summarize/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { summarizeContent, SummaryType } from "@/lib/ai/summarizer";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const type: SummaryType = body.type ?? "topic";

    const document = await prisma.document.findFirst({
      where: { id: params.id, userId: user.id, status: "READY" },
      include: { chunks: { take: 20, orderBy: { chunkIndex: "asc" } } },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found or not ready" }, { status: 404 });
    }

    const content = document.chunks.map((c) => c.content).join("\n\n");
    const summary = await summarizeContent(content, document.title, type as SummaryType);

    return NextResponse.json({ data: { summary, type } });
  } catch (error) {
    console.error("[POST /api/documents/:id/summarize]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
