// src/app/api/chat/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/ai/openai";
import { retrieveRelevantChunks, buildRAGPrompt } from "@/lib/ai/rag";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { message, sessionId, documentId } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Get or create chat session
    let session;
    if (sessionId) {
      session = await prisma.chatSession.findFirst({
        where: { id: sessionId, userId: user.id },
        include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } },
      });
    }
    if (!session) {
      session = await prisma.chatSession.create({
        data: { userId: user.id, title: message.substring(0, 50) },
        include: { messages: true },
      });
    }

    // Save user message
    await prisma.chatMessage.create({
      data: { sessionId: session.id, role: "USER", content: message },
    });

    // RAG: retrieve relevant chunks
    const sources = await retrieveRelevantChunks(message, user.id, documentId ?? undefined);
    const ragPrompt = buildRAGPrompt(message, sources);

    // Build conversation history for context
    const history = (session.messages ?? []).slice(-10).map((m) => ({
      role: m.role.toLowerCase() as "user" | "assistant",
      content: m.content,
    }));

    // Stream response from OpenAI
    const stream = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o",
      messages: [
        { role: "system", content: ragPrompt },
        ...history,
        { role: "user", content: message },
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 2000,
    });

    // Collect full response for saving to DB
    let fullContent = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Send session ID first
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ sessionId: session!.id })}\n\n`)
        );

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content ?? "";
          if (delta) {
            fullContent += delta;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`)
            );
          }
        }

        // Send sources
        if (sources.length > 0) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ sources })}\n\n`)
          );
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();

        // Save assistant message to DB
        await prisma.chatMessage.create({
          data: {
            sessionId: session!.id,
            role: "ASSISTANT",
            content: fullContent,
            sources: sources as any,
          },
        });

        // Update analytics
        await prisma.userAnalytics.upsert({
          where: { userId: user.id },
          create: { userId: user.id, chatMessages: 2 },
          update: { chatMessages: { increment: 2 } },
        });
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[POST /api/chat]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/chat — list chat sessions
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const sessions = await prisma.chatSession.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    });

    return NextResponse.json({ data: sessions });
  } catch (error) {
    console.error("[GET /api/chat]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
