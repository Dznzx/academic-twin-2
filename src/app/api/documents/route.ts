// src/app/api/documents/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { processDocument } from "@/lib/ai/document-processor";
import { ingestDocument } from "@/lib/ai/rag";
import { MAX_FILE_SIZE } from "@/lib/utils";

// GET /api/documents — list user's documents
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const subject = searchParams.get("subject");
    const status = searchParams.get("status");

    const documents = await prisma.document.findMany({
      where: {
        userId: user.id,
        ...(subject && { subject }),
        ...(status && { status: status as any }),
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        fileName: true,
        fileSize: true,
        mimeType: true,
        status: true,
        pageCount: true,
        wordCount: true,
        subject: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { chunks: true } },
      },
    });

    return NextResponse.json({ data: documents });
  } catch (error) {
    console.error("[GET /api/documents]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/documents — upload and process a document
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const subject = formData.get("subject") as string | null;
    const tags = (formData.get("tags") as string | null)?.split(",").filter(Boolean) ?? [];

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (file.size > MAX_FILE_SIZE)
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });

    // Convert to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Create document record (status: PROCESSING)
    const document = await prisma.document.create({
      data: {
        userId: user.id,
        title: file.name.replace(/\.[^/.]+$/, ""),
        fileName: file.name,
        fileUrl: "", // TODO: upload to Supabase/S3 and store URL
        fileSize: file.size,
        mimeType: file.type,
        status: "PROCESSING",
        subject: subject ?? null,
        tags,
      },
    });

    // Process document asynchronously (in production, offload to a queue)
    processAndIngestDocument(buffer, file.type, document.id, user.id).catch(
      async (err) => {
        console.error("[ingest]", err);
        await prisma.document.update({
          where: { id: document.id },
          data: { status: "FAILED" },
        });
      }
    );

    // Update analytics
    await prisma.userAnalytics.upsert({
      where: { userId: user.id },
      create: { userId: user.id, documentsUploaded: 1 },
      update: { documentsUploaded: { increment: 1 } },
    });

    return NextResponse.json({ data: document }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/documents]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function processAndIngestDocument(
  buffer: Buffer,
  mimeType: string,
  documentId: string,
  userId: string
) {
  const { text, pageCount, wordCount } = await processDocument(buffer, mimeType);
  await prisma.document.update({
    where: { id: documentId },
    data: { pageCount, wordCount },
  });
  await ingestDocument({ documentId, userId, text });
}
