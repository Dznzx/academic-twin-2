// src/app/quiz/page.tsx
"use client";

import { useState, useEffect } from "react";
import { CheckSquare, Plus, Loader2, Timer, CheckCircle, XCircle } from "lucide-react";
import { Quiz, QuizQuestion, QuizDifficulty } from "@/types";

type View = "list" | "generate" | "taking" | "results";

export default function QuizPage() {
  const [view, setView] = useState<View>("list");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [genForm, setGenForm] = useState({ documentId: "", difficulty: "MEDIUM" as QuizDifficulty, questionCount: 10 });

  useEffect(() => {
    fetchQuizzes();
    fetchDocuments();
  }, []);

  async function fetchQuizzes() {
    const res = await fetch("/api/quiz");
    const data = await res.json();
    setQuizzes(data.data ?? []);
  }

  async function fetchDocuments() {
    const res = await fetch("/api/documents?status=READY");
    const data = await res.json();
    setDocuments(data.data ?? []);
  }

  async function generateQuiz() {
    if (!genForm.documentId) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(genForm),
      });
      const data = await res.json();
      if (data.data) {
        setActiveQuiz(data.data);
        setAnswers({});
        setView("taking");
        await fetchQuizzes();
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function submitQuiz() {
    if (!activeQuiz) return;
    setIsLoading(true);
    const answersList = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }));
    try {
      const res = await fetch(`/api/quiz/${activeQuiz.id}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answersList }),
      });
      const data = await res.json();
      setResults(data.data);
      setView("results");
    } finally {
      setIsLoading(false);
    }
  }

  if (view === "generate") {
    return (
      <div className="p-6 max-w-lg">
        <button onClick={() => setView("list")} className="mb-6 text-sm text-muted-foreground hover:text-foreground">← Back</button>
        <h1 className="text-2xl font-bold mb-6">Generate Quiz</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Document</label>
            <select
              value={genForm.documentId}
              onChange={(e) => setGenForm((p) => ({ ...p, documentId: e.target.value }))}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="">Select a document...</option>
              {documents.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {(["EASY", "MEDIUM", "HARD"] as QuizDifficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setGenForm((p) => ({ ...p, difficulty: d }))}
                  className={`rounded-lg border py-2 text-sm font-medium transition-colors ${genForm.difficulty === d ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                >
                  {d.charAt(0) + d.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Number of questions: {genForm.questionCount}</label>
            <input
              type="range" min={5} max={20} value={genForm.questionCount}
              onChange={(e) => setGenForm((p) => ({ ...p, questionCount: +e.target.value }))}
              className="w-full"
            />
          </div>
          <button
            onClick={generateQuiz}
            disabled={isLoading || !genForm.documentId}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : "Generate Quiz"}
          </button>
        </div>
      </div>
    );
  }

  if (view === "taking" && activeQuiz) {
    const total = activeQuiz.questions?.length ?? 0;
    const answered = Object.keys(answers).length;
    return (
      <div className="p-6 max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-bold text-xl">{activeQuiz.title}</h1>
          <span className="text-sm text-muted-foreground">{answered}/{total} answered</span>
        </div>
        <div className="space-y-6">
          {activeQuiz.questions?.map((q: QuizQuestion, i: number) => (
            <div key={q.id} className="rounded-xl border bg-card p-5">
              <p className="font-medium mb-3"><span className="text-muted-foreground mr-2">Q{i + 1}.</span>{q.question}</p>
              {q.type === "SHORT_ANSWER" ? (
                <textarea
                  value={answers[q.id] ?? ""}
                  onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                  placeholder="Type your answer..."
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-primary outline-none"
                  rows={3}
                />
              ) : (
                <div className="space-y-2">
                  {(q.options ?? ["True", "False"]).map((opt: string) => (
                    <button
                      key={opt}
                      onClick={() => setAnswers((p) => ({ ...p, [q.id]: opt }))}
                      className={`w-full text-left rounded-lg border px-4 py-2.5 text-sm transition-colors ${answers[q.id] === opt ? "border-primary bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={submitQuiz}
          disabled={isLoading || answered === 0}
          className="mt-6 w-full rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Grading...</> : "Submit Quiz"}
        </button>
      </div>
    );
  }

  if (view === "results" && results) {
    return (
      <div className="p-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-2">Quiz Results</h1>
        <div className="rounded-xl border bg-card p-6 mb-6 text-center">
          <div className="text-5xl font-bold text-primary mb-1">{Math.round(results.percentage)}%</div>
          <p className="text-muted-foreground">{results.score} / {results.totalPoints} points</p>
        </div>
        <div className="space-y-3">
          {results.gradedAnswers?.map((a: any, i: number) => (
            <div key={i} className={`flex items-start gap-3 rounded-xl border p-4 ${a.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
              {a.isCorrect ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />}
              <div>
                <p className="text-sm font-medium">{a.isCorrect ? "Correct" : "Incorrect"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Your answer: {a.answer || "(no answer)"}</p>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => setView("list")} className="mt-6 w-full rounded-lg border py-2.5 text-sm font-medium hover:bg-muted transition-colors">
          Back to Quizzes
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quizzes</h1>
          <p className="mt-1 text-muted-foreground">Test your knowledge with AI-generated questions</p>
        </div>
        <button
          onClick={() => setView("generate")}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Generate Quiz
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <CheckSquare className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h2 className="font-semibold mb-1">No quizzes yet</h2>
          <p className="text-sm text-muted-foreground mb-4">Generate your first quiz from an uploaded document</p>
          <button onClick={() => setView("generate")} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Generate Quiz
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz: any) => (
            <div key={quiz.id} className="rounded-xl border bg-card p-5 hover:shadow-sm transition-shadow">
              <p className="font-semibold truncate">{quiz.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{quiz.document?.title}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{quiz._count?.questions ?? 0} questions</span>
                <span>·</span>
                <span className={`font-medium ${quiz.difficulty === "EASY" ? "text-green-600" : quiz.difficulty === "HARD" ? "text-red-600" : "text-yellow-600"}`}>
                  {quiz.difficulty}
                </span>
              </div>
              <button
                onClick={() => { setActiveQuiz(quiz); setAnswers({}); setView("taking"); }}
                className="mt-4 w-full rounded-lg bg-primary/10 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
              >
                Take Quiz
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
