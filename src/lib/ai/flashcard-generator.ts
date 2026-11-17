import { groq } from "./groq";
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
${content.substring(0, 6000)}

Rules:
- Front: concise, specific question or term (max 100 chars)
- Back: clear, complete answer (max 300 chars)
- Cover definitions, concepts, formulas, relationships, and key facts
- Use "What is...", "Explain...", "How does...", "What are the steps..."

Respond ONLY with a valid JSON array, no markdown fences, no extra text:
[
  {
    "front": "What is Retrieval-Augmented Generation (RAG)?",
    "back": "RAG is an AI technique that combines retrieval of relevant documents with language model generation, grounding responses in specific source material to improve accuracy."
  }
]

Return ONLY the JSON array, no other text, no markdown code fences.`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.6,
    max_tokens: 4000,
  });

  let raw = response.choices[0]?.message?.content ?? "[]";
  raw = raw.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : parsed.flashcards ?? [];
  } catch (err) {
    console.error("[generateFlashcards] Failed to parse:", raw);
    throw new Error("Failed to parse flashcards from AI response");
  }
}
