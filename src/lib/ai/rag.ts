// src/lib/ai/rag.ts
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { generateEmbedding, generateEmbeddings } from "./openai";
import { upsertEmbeddings, querySimilarChunks } from "./pinecone";
import { prisma } from "@/lib/db/prisma";
import { CitationSource } from "@/types";

// ── Text Chunking ─────────────────────────────

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
  separators: ["\n\n", "\n", ". ", "! ", "? ", " ", ""],
});

export async function chunkText(text: string): Promise<string[]> {
  return splitter.splitText(text);
}

// ── Document Ingestion Pipeline ───────────────

export async function ingestDocument(params: {
  documentId: string;
  userId: string;
  text: string;
  metadata?: { pageNumber?: number };
}) {
  const { documentId, userId, text } = params;

  // 1. Split text into chunks
  const chunks = await chunkText(text);

  // 2. Generate embeddings in batch
  const embeddings = await generateEmbeddings(chunks);

  // 3. Store chunks in Postgres
  const chunkRecords = await Promise.all(
    chunks.map((content, index) =>
      prisma.documentChunk.create({
        data: {
          documentId,
          content,
          chunkIndex: index,
          embedding: JSON.stringify(embeddings[index]),
        },
      })
    )
  );

  // 4. Upsert into Pinecone
  const vectors = chunkRecords.map((chunk, index) => ({
    id: chunk.id,
    values: embeddings[index],
    metadata: {
      documentId,
      userId,
      chunkIndex: index,
      content: chunks[index].substring(0, 500), // Pinecone metadata limit
    },
  }));

  await upsertEmbeddings(vectors);

  // 5. Mark document as ready
  await prisma.document.update({
    where: { id: documentId },
    data: {
      status: "READY",
      wordCount: text.split(/\s+/).length,
    },
  });

  return chunkRecords;
}

// ── RAG Retrieval ─────────────────────────────

export async function retrieveRelevantChunks(
  query: string,
  userId: string,
  documentId?: string,
  topK = 5
): Promise<CitationSource[]> {
  // 1. Embed the user query
  const queryEmbedding = await generateEmbedding(query);

  // 2. Find similar chunks in Pinecone
  const matches = await querySimilarChunks(queryEmbedding, userId, topK, documentId);

  if (!matches.length) return [];

  // 3. Fetch full chunk content and document info from Postgres
  const chunkIds = matches.map((m) => m.id);
  const chunks = await prisma.documentChunk.findMany({
    where: { id: { in: chunkIds } },
    include: { document: { select: { title: true, id: true } } },
  });

  return chunks.map((chunk) => ({
    documentId: chunk.documentId,
    documentTitle: chunk.document.title,
    chunkContent: chunk.content,
    pageNumber: chunk.pageNumber ?? undefined,
  }));
}

// ── Prompt Builder ────────────────────────────

export function buildRAGPrompt(
  userMessage: string,
  sources: CitationSource[]
): string {
  const context = sources
    .map(
      (s, i) =>
        `[Source ${i + 1} — ${s.documentTitle}${s.pageNumber ? `, Page ${s.pageNumber}` : ""}]\n${s.chunkContent}`
    )
    .join("\n\n---\n\n");

  return `You are an Academic Twin — an intelligent study assistant that answers questions based on the student's own uploaded materials.

CONTEXT FROM UPLOADED DOCUMENTS:
${context}

STUDENT QUESTION:
${userMessage}

INSTRUCTIONS:
- Answer based ONLY on the provided context.
- If the answer isn't in the context, say so honestly.
- Cite which source(s) you're drawing from.
- Be clear, educational, and helpful.
- Use formatting (lists, code blocks) where it helps understanding.`;
}
