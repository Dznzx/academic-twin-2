// src/lib/ai/document-processor.ts
import pdfParse from "pdf-parse";

export interface ProcessedDocument {
  text: string;
  pageCount: number;
  wordCount: number;
}

/**
 * Extract text from a PDF buffer
 */
export async function extractPDFText(buffer: Buffer): Promise<ProcessedDocument> {
  const data = await pdfParse(buffer);
  const text = data.text.trim();
  return {
    text,
    pageCount: data.numpages,
    wordCount: text.split(/\s+/).filter(Boolean).length,
  };
}

/**
 * Extract text from a plain text file
 */
export function extractTextContent(content: string): ProcessedDocument {
  const text = content.trim();
  const lines = text.split("\n");
  return {
    text,
    pageCount: Math.ceil(lines.length / 50), // estimate
    wordCount: text.split(/\s+/).filter(Boolean).length,
  };
}

/**
 * Dispatch to correct extractor based on mime type
 */
export async function processDocument(
  buffer: Buffer,
  mimeType: string,
  originalText?: string
): Promise<ProcessedDocument> {
  if (mimeType === "application/pdf") {
    return extractPDFText(buffer);
  }
  if (mimeType.startsWith("text/") && originalText) {
    return extractTextContent(originalText);
  }
  throw new Error(`Unsupported file type: ${mimeType}`);
}
