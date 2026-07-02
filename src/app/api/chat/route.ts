export const dynamic = "force-dynamic";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import Groq from "groq-sdk";
import { retrieveRelevantChunks, buildRAGPrompt } from "@/lib/ai/rag";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const message = body.message?.trim();
    const documentId = body.documentId as string | undefined;
    if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });

    const firstName = user.name?.split(" ")[0] ?? "there";

    const readyDocsCount = await prisma.document.count({
      where: { userId: user.id, status: "READY" },
    });

    const sources = readyDocsCount > 0
      ? await retrieveRelevantChunks(message, user.id, documentId, 6)
      : [];

    const tasks = await prisma.studyTask.findMany({
      where: { plan: { userId: user.id } },
      orderBy: { dueDate: "asc" },
      take: 20,
    }).catch(() => []);

    const analytics = await prisma.userAnalytics.findUnique({
      where: { userId: user.id },
    }).catch(() => null);

    const now = new Date();
    const pendingTasks = tasks.filter((t: any) => t.status !== "COMPLETED");
    const overdueTasks = pendingTasks.filter((t: any) => t.dueDate && new Date(t.dueDate) < now);

    const taskContext = pendingTasks.length > 0
      ? `Pending tasks:\n${pendingTasks.map((t: any) =>
          `- ${t.title} [${t.priority}]${t.dueDate ? ` — due ${new Date(t.dueDate).toLocaleDateString()}` : ""}${t.dueDate && new Date(t.dueDate) < now ? " (OVERDUE)" : ""}`
        ).join("\n")}`
      : "No pending tasks right now.";

    const analyticsContext = analytics
      ? `Study stats: ${analytics.totalStudyTime ?? 0} minutes studied total, ${analytics.quizzesCompleted ?? 0} quizzes completed, ${analytics.currentStreak ?? 0} day streak.`
      : "No study activity recorded yet.";

    const docContext = readyDocsCount > 0
      ? sources.length > 0
        ? `The user has ${readyDocsCount} document(s) uploaded. Relevant excerpts from their material are included below the user's message — use them naturally, like you've actually read the document.`
        : `The user has ${readyDocsCount} document(s) uploaded, but nothing matched this exact question closely. Answer from general knowledge and mention you can dig into the document if they point you to a specific topic.`
      : `No documents uploaded yet. If they ask about "their notes" or "the document", tell them to upload one first.`;

    const systemPrompt = `You are Academic Twin, a real study companion talking to ${firstName}. You're not a generic chatbot — you talk like a sharp, switched-on friend who happens to be great at explaining things. Think of how a brilliant senior or TA would actually talk to a friend, not how customer support talks to a ticket.

HOW YOU SHOULD SOUND:
- Write like a real person texting or talking, not like a corporate FAQ. Use contractions (you're, it's, don't), vary sentence length, occasionally start with "Yeah," "Okay so," "Honestly," etc.
- Don't pad responses with throat-clearing ("Great question!", "I'd be happy to help!"). Just answer.
- Don't end every message with a generic offer to help further unless it adds something.
- Have actual opinions and personality. If something's genuinely interesting, say so. If the user's slacking, tell them straight.
- Never sound like you're reading from a script or following a template.

HOW DETAILED TO BE:
- When asked to summarize, explain, or break down something — go deep. Multiple paragraphs, real structure, examples, the works. Treat it like the user actually wants to learn this, not get a one-liner.
- Use headers, bullet points, bold text, numbered steps when it genuinely helps organize a complex answer — but don't force structure onto a simple chat reply.
- For quick questions ("what time is it good to study", "should I take a break"), keep it conversational and short — match the energy of the question.
- Never artificially cut an explanation short. If the topic needs 500 words to actually make sense, write 500 words.

DOCUMENT ACCESS:
${docContext}

USER CONTEXT RIGHT NOW:
${taskContext}

${analyticsContext}
Overdue tasks: ${overdueTasks.length}
Current time: ${now.toLocaleString()}

WHEN THE USER ASKS FOR A CHECK-IN, REMINDER, OR "HOW AM I DOING":
- Be direct about overdue stuff first
- Reference their actual stats, don't make things up
- Give a clear next move, not vague encouragement

WHEN TEACHING OR EXPLAINING SOMETHING:
- Pull from document excerpts if given — actually engage with the specific content, don't just gesture at it vaguely
- Use real examples and analogies
- If the user seems confused, slow down and rebuild the explanation differently rather than repeating the same wording`;

    const finalUserMessage = sources.length > 0
      ? buildRAGPrompt(message, sources)
      : message;

    let session = await prisma.chatSession.findFirst({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } },
    });

    if (!session) {
      session = await prisma.chatSession.create({
        data: { userId: user.id, title: message.substring(0, 50) },
        include: { messages: true },
      });
    }

    await prisma.chatMessage.create({
      data: { sessionId: session.id, role: "USER", content: message },
    });

    const history = (session.messages ?? []).map((m: any) => ({
      role: m.role === "ASSISTANT" ? "assistant" : "user" as "assistant" | "user",
      content: m.content,
    }));

    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: finalUserMessage },
      ],
      stream: true,
      temperature: 0.85,
      max_tokens: 6000,
    });

    let fullContent = "";
    const sessionStart = Date.now();

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) {
              fullContent += text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();

          await prisma.chatMessage.create({
            data: { sessionId: session!.id, role: "ASSISTANT", content: fullContent },
          });

          // Track study time: count this exchange as ~2 minutes of active study time
          const minutesSpent = 2;

          await prisma.userAnalytics.upsert({
            where: { userId: user.id },
            create: { userId: user.id, chatMessages: 2, totalStudyTime: minutesSpent, lastActiveAt: new Date() },
            update: { chatMessages: { increment: 2 }, totalStudyTime: { increment: minutesSpent }, lastActiveAt: new Date() },
          });
        } catch (err) {
          console.error("Stream error:", err);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: "Hmm, something broke on my end. Try sending that again?" })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
    });
  } catch (error) {
    console.error("[POST /api/chat]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const sessions = await prisma.chatSession.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 20,
    });
    return NextResponse.json({ sessions });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
