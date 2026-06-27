// src/lib/ai/summarizer.ts
import { openai } from "./openai";

export type SummaryType = "chapter" | "topic" | "revision" | "key-points" | "formula-sheet";

export async function summarizeContent(
  content: string,
  type: SummaryType = "topic",
  documentTitle?: string
): Promise<string> {
  const prompts: Record<SummaryType, string> = {
    chapter: `Create a comprehensive chapter summary with main sections, key arguments, and important conclusions.`,
    topic: `Create a concise topic summary covering the core concepts and their relationships.`,
    revision: `Create a revision sheet with bullet points, key terms, and exam-ready notes.`,
    "key-points": `Extract the 10 most important points as a numbered list.`,
    "formula-sheet": `Extract all formulas, equations, and mathematical relationships with brief explanations.`,
  };

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert academic summarizer helping students study efficiently. ${documentTitle ? `Document: "${documentTitle}"` : ""}`,
      },
      {
        role: "user",
        content: `${prompts[type]}\n\nCONTENT:\n${content.substring(0, 12000)}`,
      },
    ],
    temperature: 0.5,
    max_tokens: 2000,
  });

  return response.choices[0].message.content ?? "";
}
