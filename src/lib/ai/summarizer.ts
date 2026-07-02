import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function summarizeDocument(content: string, title: string): Promise<string> {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `Summarize the following document titled "${title}" in a clear, concise way covering the main points:\n\n${content.substring(0, 6000)}`,
      },
    ],
    temperature: 0.5,
    max_tokens: 1000,
  });

  return response.choices[0].message.content ?? "";
}
