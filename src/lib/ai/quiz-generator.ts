// src/lib/ai/quiz-generator.ts
import { openai } from "./openai";
import { QuizQuestion, QuizDifficulty } from "@/types";

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
${content.substring(0, 8000)}

Respond ONLY with a valid JSON array of questions matching this exact structure:
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
  },
  {
    "type": "SHORT_ANSWER",
    "question": "Explain...",
    "correctAnswer": "Model answer here",
    "explanation": "Key points to look for",
    "points": 2
  }
]

Return ONLY the JSON array, no other text.`;

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const raw = response.choices[0].message.content ?? "{}";
  
  try {
    // Handle both array and object with "questions" key
    const parsed = JSON.parse(raw);
    const questions: QuizQuestion[] = Array.isArray(parsed)
      ? parsed
      : parsed.questions ?? [];
    
    return questions.map((q, i) => ({
      ...q,
      id: `temp-${i}`,
      quizId: "",
    }));
  } catch {
    throw new Error("Failed to parse quiz questions from AI response");
  }
}
