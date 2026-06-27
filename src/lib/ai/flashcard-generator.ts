// src/lib/ai/flashcard-generator.ts
import { openai } from "./openai";
import { Flashcard } from "@/types";

interface GenerateFlashcardsParams {
  content: string;
  documentTitle: string;
  count?: number;
}

export async function generateFlashcards(
  params: GenerateFlashcardsParams
): Promise<Omit<Flashcard, "id" | "setId" | "difficulty" | "nextReview" | "reviewCount">[]> {
  const { content, documentTitle, count = 20 } = params;

  const prompt = `You are an expert flashcard creator using evidence-based learning techniques.

Create ${count} flashcards from this academic content using active recall and spaced repetition principles.
Document: "${documentTitle}"

CONTENT:
${content.substring(0, 8000)}

Rules:
- Front: concise, specific question or term (max 100 chars)
- Back: clear, complete answer (max 300 chars)
- Cover definitions, concepts, formulas, relationships, and key facts
- Use "What is...", "Explain...", "How does...", "What are the steps..."

Respond ONLY with a valid JSON array:
[
  {
    "front": "What is Retrieval-Augmented Generation (RAG)?",
    "back": "RAG is an AI technique that combines retrieval of relevant documents with language model generation, grounding responses in specific source material to improve accuracy."
  }
]

Return ONLY the JSON array, no other text.`;

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.6,
  });

  const raw = response.choices[0].message.content ?? "{}";

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : parsed.flashcards ?? [];
  } catch {
    throw new Error("Failed to parse flashcards from AI response");
  }
}
