// src/lib/ai/groq.ts
import Groq from "groq-sdk";

let client: Groq | undefined;

// Created on first use rather than at import time, so `next build` (which
// loads every route module) works without GROQ_API_KEY being set.
export function getGroq(): Groq {
  if (!client) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set. Add it to .env.local.");
    }
    client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return client;
}

export const groq = new Proxy({} as Groq, {
  get: (_target, prop) => Reflect.get(getGroq(), prop),
});
