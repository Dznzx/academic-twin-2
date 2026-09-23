// src/components/upload/DocumentCard.tsx
"use client";
import { useState } from "react";
import { FileText, Trash2, MessageSquare, CheckSquare, Layers, Loader2, ChevronDown } from "lucide-react";
import { formatBytes, formatRelativeDate } from "@/lib/utils";
import Link from "next/link";

interface DocumentCardProps {
  doc: {
    id: string;
    title: string;
    fileName: string;
    fileSize: number;
    status: string;
    pageCount?: number;
    wordCount?: number;
    subject?: string;
    createdAt: Date;
  };
  onDelete?: (id: string) => void;
}

const SummaryTypes = [
  { value: "topic", label: "Topic Summary" },
  { value: "chapter", label: "Chapter Summary" },
  { value: "revision", label: "Revision Sheet" },
  { value: "key-points", label: "Key Points" },
  { value: "formula-sheet", label: "Formula Sheet" },
];

export default function DocumentCard({ doc, onDelete }: DocumentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryType, setSummaryType] = useState("topic");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState(false);

  async function generateSummary() {
    setLoadingSummary(true);
    setSummaryError(false);
    try {
      const res = await fetch(`/api/documents/${doc.id}/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: summaryType }),
      });
      if (!res.ok) throw new Error("Failed to summarize");
      const data = await res.json();
      setSummary(data.data?.summary ?? "");
    } catch {
      setSummaryError(true);
    } finally {
      setLoadingSummary(false);
    }
  }

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-start gap-4 p-5">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold truncate">{doc.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{doc.fileName} · {formatBytes(doc.fileSize)}</p>
            </div>
            <span className={`flex-shrink-0 text-xs px-2 py-1 rounded-full font-medium border ${
              doc.status === "READY" ? "bg-green-400/10 text-green-400 border-green-400/20"
              : doc.status === "FAILED" ? "bg-red-400/10 text-red-400 border-red-400/20"
              : "bg-yellow-400/10 text-yellow-400 border-yellow-400/20"
            }`}>
              {doc.status}
            </span>
          </div>

          {doc.status === "READY" && (
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {doc.pageCount && <span>{doc.pageCount} pages</span>}
              {doc.wordCount && <span>{doc.wordCount.toLocaleString()} words</span>}
              {doc.subject && <span className="rounded-full bg-muted px-2 py-0.5">{doc.subject}</span>}
              <span>{formatRelativeDate(new Date(doc.createdAt))}</span>
            </div>
          )}
        </div>
      </div>

      {doc.status === "READY" && (
        <>
          <div className="border-t px-5 py-3 flex items-center gap-2 flex-wrap">
            <Link
              href={`/chat?documentId=${doc.id}`}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium border hover:bg-muted transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5" /> Chat
            </Link>
            <Link
              href={`/quiz?documentId=${doc.id}`}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium border hover:bg-muted transition-colors"
            >
              <CheckSquare className="h-3.5 w-3.5" /> Quiz
            </Link>
            <Link
              href={`/flashcards?documentId=${doc.id}`}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium border hover:bg-muted transition-colors"
            >
              <Layers className="h-3.5 w-3.5" /> Flashcards
            </Link>
            <button
              onClick={() => setExpanded((e) => !e)}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium border hover:bg-muted transition-colors ml-auto"
            >
              Summarize <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(doc.id)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {expanded && (
            <div className="border-t p-5 space-y-3">
              <div className="flex items-center gap-3">
                <select
                  value={summaryType}
                  onChange={(e) => setSummaryType(e.target.value)}
                  className="flex-1 rounded-lg border bg-background px-3 py-1.5 text-sm"
                >
                  {SummaryTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <button
                  onClick={generateSummary}
                  disabled={loadingSummary}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {loadingSummary ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate"}
                </button>
              </div>
              {summary && (
                <div className="rounded-lg bg-muted p-4 text-sm leading-relaxed whitespace-pre-wrap">
                  {summary}
                </div>
              )}
              {summaryError && (
                <p className="text-xs text-red-400">Failed to generate summary. Try again.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
