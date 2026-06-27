// src/lib/ai/openai.ts
// Using Google Gemini (free tier) — swap GEMINI_API_KEY for OPENAI_API_KEY at launch
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Export a Gemini chat model — used like openai.chat.completions.create()
export const openai = {
  chat: {
    completions: {
      create: async (params: {
        model?: string;
        messages: Array<{ role: string; content: string }>;
        temperature?: number;
        max_tokens?: number;
        stream?: boolean;
        response_format?: { type: string };
      }) => {
        const model = genAI.getGenerativeModel({
          model: process.env.GEMINI_MODEL ?? "gemini-1.5-flash",
          generationConfig: {
            temperature: params.temperature ?? 0.7,
            maxOutputTokens: params.max_tokens ?? 2000,
            ...(params.response_format?.type === "json_object"
              ? { responseMimeType: "application/json" }
              : {}),
          },
        });

        // Convert messages to Gemini format
        const systemMsg = params.messages.find((m) => m.role === "system");
        const userMessages = params.messages.filter((m) => m.role !== "system");

        const history = userMessages.slice(0, -1).map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

        const lastMessage = userMessages[userMessages.length - 1];
        const prompt = systemMsg
          ? `${systemMsg.content}\n\n${lastMessage?.content ?? ""}`
          : lastMessage?.content ?? "";

        if (params.stream) {
          const chat = model.startChat({ history });
          const result = await chat.sendMessageStream(prompt);

          // Return async iterator compatible with OpenAI stream format
          return (async function* () {
            for await (const chunk of result.stream) {
              const text = chunk.text();
              if (text) {
                yield {
                  choices: [{ delta: { content: text }, finish_reason: null }],
                };
              }
            }
          })();
        } else {
          const chat = model.startChat({ history });
          const result = await chat.sendMessage(prompt);
          const text = result.response.text();
          return {
            choices: [{ message: { content: text, role: "assistant" } }],
          };
        }
      },
    },
  },
};

// ── Embeddings using Gemini ───────────────────
// Gemini embedding model outputs 768 dimensions
// Update Pinecone index dimensions to 768 when using Gemini

export async function generateEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text.replace(/\n/g, " "));
  return result.embedding.values;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const results = await Promise.all(
    texts.map((t) => model.embedContent(t.replace(/\n/g, " ")))
  );
  return results.map((r) => r.embedding.values);
}
