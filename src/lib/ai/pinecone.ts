// src/lib/ai/pinecone.ts
import { Pinecone } from "@pinecone-database/pinecone";

const globalForPinecone = globalThis as unknown as {
  pinecone: Pinecone | undefined;
};

// Created on first use rather than at import time, so `next build` (which
// loads every route module) works without PINECONE_API_KEY being set.
export function getPinecone(): Pinecone {
  if (!globalForPinecone.pinecone) {
    if (!process.env.PINECONE_API_KEY) {
      throw new Error("PINECONE_API_KEY is not set. Add it to .env.local.");
    }
    globalForPinecone.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
  }
  return globalForPinecone.pinecone;
}

export function getPineconeIndex() {
  return getPinecone().index(process.env.PINECONE_INDEX ?? "academic-twin");
}

/**
 * Upsert document chunk embeddings into Pinecone
 */
export async function upsertEmbeddings(
  vectors: Array<{
    id: string;
    values: number[];
    metadata: {
      documentId: string;
      userId: string;
      chunkIndex: number;
      content: string;
      pageNumber?: number;
    };
  }>
) {
  const index = getPineconeIndex();
  await index.upsert(vectors);
}

/**
 * Query Pinecone for nearest neighbor chunks
 */
export async function querySimilarChunks(
  embedding: number[],
  userId: string,
  topK = 5,
  documentId?: string
) {
  const index = getPineconeIndex();
  const filter: Record<string, string> = { userId };
  if (documentId) filter.documentId = documentId;

  const result = await index.query({
    vector: embedding,
    topK,
    filter,
    includeMetadata: true,
  });

  return result.matches ?? [];
}

/**
 * Delete all chunks for a document
 */
export async function deleteDocumentVectors(documentId: string, userId: string) {
  const index = getPineconeIndex();
  await index.deleteMany({ documentId, userId });
}
