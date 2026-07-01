import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { prisma } from "@/lib/db/prisma";
import { CitationSource } from "@/types";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
  separators: ["\n\n", "\n", " ", "! ", "? ", ". ", ""],
});

function sanitizeText(text) {
  return text.replace(/\u0000/g, "");
}

export async function chunkText(text: string): Promise<string[]>: Promise<string[]> {
  return splitter.splitText(text);
}

// Store document chunks in DB only (no embeddings/Pinecone needed)
export async function ingestDocument(params: {
  documentId: string;
  userId: string;
  text: string;
  metadata?: { pageNumber?: number };
}) {
  const { documentId, userId, text } = params;

  // Split text into chunks
  const chunks = await chunkText(sanitizeText(text));

  // Store chunks in Postgres with no embeddings
  await Promise.all(
    chunks.map((content, index) =>
      prisma.documentChunk.create({
        data: {
          documentId,
          content,
          chunkIndex: index,
          embedding: "[]", // empty — no embeddings needed
        },
      })
    )
  );

  // Mark document as READY
  await prisma.document.update({
    where: { id: documentId },
    data: { status: "READY", wordCount: text.split(/\s+/).filter(Boolean).length },
  });

  console.log(`[ingest] Document ${documentId} ingested with ${chunks.length} chunks`);
}

// Retrieve relevant chunks using simple keyword search (no vector search)
export async function retrieveRelevantChunks(
  query: string,
  userId: string,
  documentId?: string,
  topK = 5
): Promise<CitationSource[]> {
  // Get chunks from the user's documents
  const chunks = await prisma.documentChunk.findMany({
    where: {
      document: {
        userId,
        status: "READY",
        ...(documentId ? { id: documentId } : {}),
      },
    },
    include: {
      document: { select: { title: true, id: true } },
    },
    take: 100,
  });

  if (!chunks.length) return [];

  // Simple keyword relevance scoring
  const queryWords = query.toLowerCase().split(/\s+/).filter(Boolean);

  const scored = chunks.map((chunk) => {
    const content = chunk.content.toLowerCase();
    const score = queryWords.reduce((acc, word) => {
      const matches = (content.match(new RegExp(word, "g")) || []).length;
      return acc + matches;
    }, 0);
    return { chunk, score };
  });

  // Sort by relevance and take top K
  const top = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter((s) => s.score > 0);

  return top.map(({ chunk }) => ({
    documentId: chunk.documentId,
    documentTitle: chunk.document.title,
    chunkContent: chunk.content,
    pageNumber: undefined,
  }));
}

export function buildRAGPrompt(
  userMessage: string,
  sources: CitationSource[]
): string {
  if (!sources.length) {
    return `You are Academic Twin, an intelligent study assistant. Answer the student's question helpfully and clearly.\n\nSTUDENT QUESTION:\n${userMessage}`;
  }

  const context = sources
    .map((s, i) => `[Source ${i + 1} — ${s.documentTitle}]\n${s.chunkContent}`)
    .join("\n\n---\n\n");

  return `You are Academic Twin, an intelligent study assistant that answers questions based on the student's own uploaded materials.

CONTEXT FROM UPLOADED DOCUMENTS:
${context}

STUDENT QUESTION:
${userMessage}

INSTRUCTIONS:
- Answer based on the provided context when relevant.
- If the answer isn't in the context, say so and answer from general knowledge.
- Cite which source you're drawing from.
- Be clear, educational, and helpful.`;
}
