"use client";
import { useState, useEffect } from "react";
import { CheckSquare, Trophy, RotateCcw, ChevronRight, Loader2, Sparkles, FileText, ArrowLeft } from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface QuizListItem {
  id: string;
  title: string;
  _count?: { questions: number };
}

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

interface Doc { id: string; title: string; status: string; }

const DIFFICULTIES = [
  { value: "EASY", label: "Easy", desc: "Basic recall & comprehension" },
  { value: "MEDIUM", label: "Medium", desc: "Application & analysis" },
  { value: "HARD", label: "Hard", desc: "Synthesis & critical thinking" },
];

const QUESTION_COUNTS = [5, 8, 10, 15, 20];

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [selected, setSelected] = useState<Quiz | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);

  // Generation config state
  const [genDoc, setGenDoc] = useState<Doc | null>(null);
  const [genDifficulty, setGenDifficulty] = useState("MEDIUM");
  const [genCount, setGenCount] = useState(10);

  const fetchAll = () => {
    Promise.all([
      fetch("/api/quiz").then((r) => r.json()),
      fetch("/api/documents").then((r) => r.json()),
    ]).then(([quizData, docData]) => {
      setQuizzes(quizData.data ?? quizData.quizzes ?? []);
      const docs = (docData.data ?? docData.documents ?? []).filter((d: Doc) => d.status === "READY");
      setDocuments(docs);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const openQuiz = async (quizId: string) => {
    setLoadingQuiz(true);
    try {
      const res = await fetch(`/api/quiz/${quizId}`);
      const data = await res.json();
      setSelected(data.data ?? data.quiz ?? data);
    } catch {
      alert("Failed to load quiz.");
    } finally {
      setLoadingQuiz(false);
    }
  };

  const generateQuiz = async () => {
    if (!genDoc) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: genDoc.id, difficulty: genDifficulty, questionCount: genCount }),
      });
      if (res.ok) {
        fetchAll();
        setShowGenerate(false);
        setGenDoc(null);
      } else {
        alert("Failed to generate quiz. Try again.");
      }
    } catch {
      alert("Something went wrong generating the quiz.");
    } finally {
      setGenerating(false);
    }
  };

  const score = selected ? selected.questions.filter((q, i) => answers[i] === q.correctAnswer).length : 0;
  const reset = () => { setSelected(null); setCurrent(0); setAnswers({}); setSubmitted(false); };

  if (loading) return (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-14 px-6 border-b border-border glass shrink-0">
        <CheckSquare className="h-4 w-4 text-muted-foreground mr-2" />
        <h1 className="text-sm font-medium text-foreground">Quizzes</h1>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    </div>
  );

  if (submitted && selected) return (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-14 px-6 border-b border-border glass shrink-0">
        <CheckSquare className="h-4 w-4 text-muted-foreground mr-2" />
        <h1 className="text-sm font-medium text-foreground">Quizzes</h1>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto gold-glow">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-foreground">Quiz complete</h2>
            <p className="text-sm text-muted-foreground mt-1">{selected.title}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-4xl font-medium text-foreground">{score}<span className="text-xl text-muted-foreground">/{selected.questions.length}</span></p>
            <p className="text-sm text-muted-foreground mt-1">{Math.round((score / selected.questions.length) * 100)}% correct</p>
          </div>
          <div className="space-y-3 text-left max-h-72 overflow-y-auto">
            {selected.questions.map((q, i) => (
              <div key={q.id} className={`rounded-lg border p-3 ${answers[i] === q.correctAnswer ? "border-emerald-400/30 bg-emerald-400/5" : "border-red-400/30 bg-red-400/5"}`}>
                <p className="text-sm font-medium text-foreground">{q.question}</p>
                <p className="text-xs mt-1 text-muted-foreground">Your answer: <span className={answers[i] === q.correctAnswer ? "text-emerald-400" : "text-red-400"}>{answers[i] ?? "Not answered"}</span></p>
                {answers[i] !== q.correctAnswer && <p className="text-xs text-emerald-400 mt-0.5">Correct: {q.correctAnswer}</p>}
              </div>
            ))}
          </div>
          <button onClick={reset} className="flex items-center gap-2 mx-auto px-4 py-2 rounded-md border border-border text-sm hover:bg-secondary transition-colors">
            <RotateCcw className="h-4 w-4" /> Back to quizzes
          </button>
        </div>
      </div>
    </div>
  );

  if (selected) {
    const q = selected.questions[current];
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-14 px-6 border-b border-border glass shrink-0">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
            <h1 className="text-sm font-medium text-foreground">{selected.title}</h1>
          </div>
          <span className="text-xs text-muted-foreground">{current + 1} / {selected.questions.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${((current + 1) / selected.questions.length) * 100}%` }} />
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Question {current + 1}</p>
              <p className="text-base font-medium text-foreground leading-relaxed">{q.question}</p>
            </div>
            <div className="space-y-2">
              {q.options.map((opt) => (
                <button key={opt} onClick={() => setAnswers((prev) => ({ ...prev, [current]: opt }))} className={`w-full text-left rounded-xl border px-4 py-3.5 text-sm transition-colors ${answers[current] === opt ? "border-primary bg-primary/10 text-primary font-medium" : "border-border bg-card text-foreground hover:border-primary/30 hover:bg-secondary"}`}>
                  {opt}
                </button>
              ))}
            </div>
            <div className="flex justify-between pt-2">
              <button onClick={() => setCurrent((p) => Math.max(0, p - 1))} disabled={current === 0} className="px-4 py-2 rounded-md border border-border text-sm text-foreground hover:bg-secondary disabled:opacity-40 transition-colors">Previous</button>
              {current < selected.questions.length - 1 ? (
                <button onClick={() => setCurrent((p) => p + 1)} disabled={!answers[current]} className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors">
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length < selected.questions.length} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors">Submit quiz</button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-14 px-6 border-b border-border glass shrink-0">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-muted-foreground" />
          <h1 className="text-sm font-medium text-foreground">Quizzes</h1>
        </div>
        <button onClick={() => { setShowGenerate((p) => !p); setGenDoc(null); }} disabled={documents.length === 0} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-40 transition-all duration-200">
          <Sparkles className="h-3.5 w-3.5" /> Generate quiz
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <div>
            <h2 className="text-lg font-medium text-foreground">Your quizzes</h2>
            <p className="text-sm text-muted-foreground mt-1">Select a quiz to test your knowledge.</p>
          </div>

          {showGenerate && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-4">
              {!genDoc ? (
                <>
                  <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" /> Step 1: Pick a document
                  </p>
                  {documents.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No ready documents yet. Upload one first.</p>
                  ) : (
                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <button key={doc.id} onClick={() => setGenDoc(doc)} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-secondary transition-all duration-200 text-left">
                          <FileText className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-sm text-foreground flex-1">{doc.title}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setGenDoc(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" /> {genDoc.title}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Difficulty</p>
                    <div className="grid grid-cols-3 gap-2">
                      {DIFFICULTIES.map((d) => (
                        <button key={d.value} onClick={() => setGenDifficulty(d.value)} className={`rounded-lg border px-3 py-2.5 text-left transition-all duration-200 ${genDifficulty === d.value ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/30"}`}>
                          <p className={`text-xs font-medium ${genDifficulty === d.value ? "text-primary" : "text-foreground"}`}>{d.label}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{d.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Number of questions</p>
                    <div className="flex gap-2">
                      {QUESTION_COUNTS.map((n) => (
                        <button key={n} onClick={() => setGenCount(n)} className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-all duration-200 ${genCount === n ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:border-primary/30"}`}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button onClick={generateQuiz} disabled={generating} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-all duration-200 gold-glow">
                    {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate {genCount} questions</>}
                  </button>
                </>
              )}
            </div>
          )}

          {quizzes.length === 0 && !showGenerate ? (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-border bg-card">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 gold-glow">
                <CheckSquare className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">No quizzes yet</p>
              <p className="text-xs text-muted-foreground mt-1">Upload a document and generate a quiz to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {quizzes.map((quiz) => (
                <button key={quiz.id} onClick={() => openQuiz(quiz.id)} disabled={loadingQuiz} className="w-full flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 hover:border-primary/40 hover:shadow-sm transition-all text-left group disabled:opacity-60">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{quiz.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{quiz._count?.questions ?? 0} questions</p>
                  </div>
                  {loadingQuiz ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
