import Groq from "groq-sdk";
import { QuizQuestion, QuizDifficulty } from "@/types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface GenerateQuizParams {
  content: string;
  documentTitle: string;
  difficulty: QuizDifficulty;
  questionCount?: number;
  types?: Array<"MCQ" | "SHORT_ANSWER" | "TRUE_FALSE">;
}

export async function generateQuiz(params: GenerateQuizParams): Promise<QuizQuestion[]> {
  const {
    content,
    documentTitle,
    difficulty,
    questionCount = 10,
    types = ["MCQ", "TRUE_FALSE"],
  } = params;

  const difficultyMap = {
    EASY: "basic recall and comprehension",
    MEDIUM: "application and analysis",
    HARD: "synthesis, evaluation, and critical thinking",
  };

  const prompt = `You are an expert academic quiz generator.

Generate ${questionCount} quiz questions from the following content.
Document: "${documentTitle}"
Difficulty: ${difficulty} — focus on ${difficultyMap[difficulty]}
Question types to include: ${types.join(", ")}

CONTENT:
${content.substring(0, 6000)}

Respond ONLY with a valid JSON array of questions matching this exact structure, no markdown fences, no extra text:
[
  {
    "type": "MCQ",
    "question": "What is...?",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "correctAnswer": "A) Option 1",
    "explanation": "Brief explanation of why this is correct",
    "points": 1
  },
  {
    "type": "TRUE_FALSE",
    "question": "Statement to evaluate",
    "options": ["True", "False"],
    "correctAnswer": "True",
    "explanation": "Brief explanation",
    "points": 1
  }
]

Return ONLY the JSON array, no other text, no markdown code fences.`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 4000,
  });

  let raw = response.choices[0]?.message?.content ?? "[]";

  // Strip markdown code fences if present
  raw = raw.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");

  try {
    const parsed = JSON.parse(raw);
    const questions: QuizQuestion[] = Array.isArray(parsed) ? parsed : parsed.questions ?? [];

    return questions.map((q, i) => ({
      ...q,
      id: `temp-${i}`,
      quizId: "",
    }));
  } catch (err) {
    console.error("[generateQuiz] Failed to parse:", raw);
    throw new Error("Failed to parse quiz questions from AI response");
  }
}
