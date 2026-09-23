"use client";
import { useState, useEffect } from "react";
import { NotebookPen, Sparkles, FileText, ArrowLeft, Loader2, Trash2, ChevronRight, Layers } from "lucide-react";

interface Note {
  id: string;
  title: string;
  topic: string;
  style: string;
  content: string;
  createdAt: string;
}

interface Doc { id: string; title: string; status: string; }

const STYLES = [
  { value: "OUTLINE", label: "Structured Outline", desc: "Headers, bullets, key terms" },
  { value: "CORNELL", label: "Cornell Notes", desc: "Cues, notes, summary" },
  { value: "EXAM_FOCUSED", label: "Exam-Focused", desc: "Definitions, facts, likely questions" },
];

function renderMarkdown(md: string) {
  const lines = md.split("\n");
  const elements: JSX.Element[] = [];
  let listBuffer: string[] = [];

  const flushList = (key: string) => {
    if (listBuffer.length) {
      elements.push(
        <ul key={key} className="space-y-1.5 my-3 ml-1">
          {listBuffer.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-foreground/90 leading-relaxed">
              <span className="text-primary mt-1.5 shrink-0">•</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            </li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  function escapeHtml(text: string) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function formatInline(text: string) {
    return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>');
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("## ")) {
      flushList(`list-${i}`);
      elements.push(<h2 key={i} className="text-lg font-semibold text-primary mt-6 mb-2 first:mt-0">{trimmed.slice(3)}</h2>);
    } else if (trimmed.startsWith("### ")) {
      flushList(`list-${i}`);
      elements.push(<h3 key={i} className="text-sm font-semibold text-foreground mt-4 mb-1.5">{trimmed.slice(4)}</h3>);
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      listBuffer.push(trimmed.slice(2));
    } else if (trimmed === "") {
      flushList(`list-${i}`);
    } else {
      flushList(`list-${i}`);
      elements.push(<p key={i} className="text-sm text-foreground/90 leading-relaxed mb-2" dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />);
    }
  });
  flushList("list-end");
  return elements;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [selected, setSelected] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);

  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState("OUTLINE");
  const [docId, setDocId] = useState<string | null>(null);

  const fetchAll = () => {
    Promise.all([
      fetch("/api/notes").then((r) => r.json()),
      fetch("/api/documents").then((r) => r.json()),
    ]).then(([noteData, docData]) => {
      setNotes(noteData.data ?? []);
      const docs = (docData.data ?? docData.documents ?? []).filter((d: Doc) => d.status === "READY");
      setDocuments(docs);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const generate = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, style, documentId: docId }),
      });
      if (res.ok) {
        const data = await res.json();
        fetchAll();
        setShowGenerate(false);
        setTopic(""); setDocId(null); setStyle("OUTLINE");
        setSelected(data.data);
      } else {
        alert("Failed to generate notes. Try again.");
      }
    } catch {
      alert("Something went wrong.");
    } finally {
      setGenerating(false);
    }
  };

  const deleteNote = async (id: string) => {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    setSelected(null);
    fetchAll();
  };

  if (loading) return (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-14 px-6 border-b border-border glass shrink-0">
        <NotebookPen className="h-4 w-4 text-muted-foreground mr-2" />
        <h1 className="text-sm font-medium text-foreground">Notes</h1>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    </div>
  );

  if (selected) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-14 px-6 border-b border-border glass shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <NotebookPen className="h-4 w-4 text-muted-foreground shrink-0" />
            <h1 className="text-sm font-medium text-foreground truncate">{selected.title}</h1>
          </div>
          <button onClick={() => deleteNote(selected.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-red-400 hover:border-red-400/30 transition-all duration-200 shrink-0">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {STYLES.find((s) => s.value === selected.style)?.label ?? selected.style}
              </span>
              <span className="text-xs text-muted-foreground">{new Date(selected.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="rounded-2xl border border-border bg-card p-8 gold-glow">
              {renderMarkdown(selected.content)}
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
          <NotebookPen className="h-4 w-4 text-muted-foreground" />
          <h1 className="text-sm font-medium text-foreground">Notes</h1>
        </div>
        <button onClick={() => setShowGenerate((p) => !p)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-all duration-200">
          <Sparkles className="h-3.5 w-3.5" /> Generate notes
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <div>
            <h2 className="text-lg font-medium text-foreground">Your notes</h2>
            <p className="text-sm text-muted-foreground mt-1">Generate detailed, exam-ready notes on any topic.</p>
          </div>

          {showGenerate && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-4">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Generate new notes
              </p>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Topic</p>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Neural Networks, French Revolution, Thermodynamics..."
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Source (optional)</p>
                {documents.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No documents uploaded — notes will use general knowledge.</p>
                ) : (
                  <div className="space-y-1.5">
                    <button onClick={() => setDocId(null)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-all duration-200 ${docId === null ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/30"}`}>
                      <Sparkles className={`h-3.5 w-3.5 shrink-0 ${docId === null ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-xs ${docId === null ? "text-primary font-medium" : "text-foreground"}`}>General knowledge (no document)</span>
                    </button>
                    {documents.map((doc) => (
                      <button key={doc.id} onClick={() => setDocId(doc.id)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-all duration-200 ${docId === doc.id ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/30"}`}>
                        <FileText className={`h-3.5 w-3.5 shrink-0 ${docId === doc.id ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-xs flex-1 ${docId === doc.id ? "text-primary font-medium" : "text-foreground"}`}>{doc.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Style</p>
                <div className="space-y-1.5">
                  {STYLES.map((s) => (
                    <button key={s.value} onClick={() => setStyle(s.value)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-left transition-all duration-200 ${style === s.value ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/30"}`}>
                      <div>
                        <p className={`text-xs font-medium ${style === s.value ? "text-primary" : "text-foreground"}`}>{s.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</p>
                      </div>
                      {style === s.value && <ChevronRight className="h-3.5 w-3.5 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={generate} disabled={generating || !topic.trim()} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-all duration-200 gold-glow">
                {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Writing your notes...</> : <><Sparkles className="h-4 w-4" /> Generate notes</>}
              </button>
            </div>
          )}

          {notes.length === 0 && !showGenerate ? (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-border bg-card">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 gold-glow">
                <NotebookPen className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">No notes yet</p>
              <p className="text-xs text-muted-foreground mt-1">Generate your first set of study notes.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notes.map((note) => (
                <button key={note.id} onClick={() => setSelected(note)} className="w-full flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 hover:border-primary/40 hover:shadow-sm transition-all text-left group">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <NotebookPen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{note.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{STYLES.find((s) => s.value === note.style)?.label ?? note.style} · {new Date(note.createdAt).toLocaleDateString()}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
