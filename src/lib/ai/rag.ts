import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { prisma } from "@/lib/db/prisma";
import { CitationSource } from "@/types";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
  separators: ["\n\n", "\n", " ", "! ", "? ", ". ", ""],
});

function sanitizeText(text: string): string {
  return text.replace(/\u0000/g, "");
}

export async function chunkText(text: string): Promise<string[]> {
  return splitter.splitText(sanitizeText(text));
}

export async function ingestDocument(params: {
  documentId: string;
  userId: string;
  text: string;
  metadata?: { pageNumber?: number };
}) {
  const { documentId, text } = params;
  const chunks = await chunkText(text);

  await Promise.all(
    chunks.map((content, index) =>
      prisma.documentChunk.create({
        data: {
          documentId,
          content,
          chunkIndex: index,
          embedding: "[]",
        },
      })
    )
  );

  await prisma.document.update({
    where: { id: documentId },
    data: { status: "READY", wordCount: text.split(/\s+/).filter(Boolean).length },
  });
}

export async function retrieveRelevantChunks(
  query: string,
  userId: string,
  documentId?: string,
  topK = 5
): Promise<CitationSource[]> {
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

  const queryWords = query.toLowerCase().split(/\s+/).filter(Boolean);

  const scored = chunks.map((chunk) => {
    const content = chunk.content.toLowerCase();
    const score = queryWords.reduce((acc, word) => {
      const matches = (content.match(new RegExp(word, "g")) || []).length;
      return acc + matches;
    }, 0);
    return { chunk, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter((s) => s.score > 0)
    .map(({ chunk }) => ({
      documentId: chunk.documentId,
      documentTitle: chunk.document.title,
      chunkContent: chunk.content,
      pageNumber: undefined,
    }));
}

export function buildRAGPrompt(userMessage: string, sources: CitationSource[]): string {
  if (!sources.length) return userMessage;

  const context = sources
    .map((s, i) => `[Source ${i + 1} — ${s.documentTitle}]\n${s.chunkContent}`)
    .join("\n\n---\n\n");

  return `CONTEXT FROM UPLOADED DOCUMENTS:
${context}

STUDENT QUESTION:
${userMessage}

Answer based on the provided context. Cite which source you're drawing from.`;
}
