import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export type SummaryType = "brief" | "detailed" | "bullet" | "academic";

export async function summarizeContent(
  content: string,
  title: string,
  type: SummaryType = "detailed"
): Promise<string> {
  const instructions: Record<SummaryType, string> = {
    brief: "Write a brief 2-3 sentence summary of the main point.",
    detailed: "Write a detailed summary covering all major topics, concepts, and key points.",
    bullet: "Summarize as a bulleted list of key points. Use clear, concise bullets.",
    academic: "Write an academic-style summary with an overview, main arguments, and conclusion.",
  };

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `Summarize the following document titled "${title}".\n\nStyle: ${instructions[type]}\n\nCONTENT:\n${content.substring(0, 6000)}`,
      },
    ],
    temperature: 0.5,
    max_tokens: 2000,
  });

  return response.choices[0].message.content ?? "";
}

export async function summarizeDocument(content: string, title: string): Promise<string> {
  return summarizeContent(content, title, "detailed");
}
