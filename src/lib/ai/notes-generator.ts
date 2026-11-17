import { groq } from "./groq";


export type NoteStyle = "OUTLINE" | "CORNELL" | "EXAM_FOCUSED";

interface GenerateNotesParams {
  content: string;
  topic: string;
  style: NoteStyle;
}

const styleInstructions: Record<NoteStyle, string> = {
  OUTLINE: `Format as a clean structured outline using markdown:
- Use ## for main sections, ### for subsections
- Use bullet points for details under each heading
- Bold key terms the first time they appear
- Include a "Key Terms" section at the end with brief definitions`,
  CORNELL: `Format as Cornell-style notes using markdown with three clear parts:
## Cues
A bulleted list of key questions or trigger words that would help recall the material.

## Notes
The main detailed content, organized with ### subheadings and bullet points.

## Summary
A 2-4 sentence summary capturing the core takeaway, written in plain language.`,
  EXAM_FOCUSED: `Format as exam-prep notes using markdown:
## Must-Know Definitions
Bulleted list of key terms with concise definitions.

## Core Concepts
### subheadings per concept, explained clearly with examples where relevant.

## Formulas / Key Facts
Any formulas, dates, or critical facts in a clear list (skip if not applicable).

## Likely Exam Questions
3-5 questions a professor might ask, with brief answer guidance for each.`,
};

export async function generateNotes(params: GenerateNotesParams): Promise<string> {
  const { content, topic, style } = params;

  const prompt = `You are an expert academic note-taker creating premium, polished study notes for a student.

Topic: "${topic}"
${content ? `Source material:\n${content.substring(0, 7000)}` : "No source material provided — use your own knowledge of this topic."}

${styleInstructions[style]}

General rules:
- Be thorough and detailed — these are real study notes a student will rely on, not a shallow summary
- Use clear, confident, well-organized markdown
- Do not include any preamble like "Here are your notes" — start directly with the content
- Do not wrap the output in code fences`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.6,
    max_tokens: 6000,
  });

  return response.choices[0]?.message?.content?.trim() ?? "";
}
