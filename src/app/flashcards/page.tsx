// src/app/flashcards/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Layers, Plus, ChevronLeft, ChevronRight, RotateCcw, Loader2 } from "lucide-react";

export default function FlashcardsPage() {
  const [sets, setSets] = useState<any[]>([]);
  const [activeSet, setActiveSet] = useState<any | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGen, setShowGen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState("");

  useEffect(() => {
    fetchSets();
    fetchDocuments();
  }, []);

  async function fetchSets() {
    const res = await fetch("/api/flashcards");
    const data = await res.json();
    setSets(data.data ?? []);
  }

  async function fetchDocuments() {
    const res = await fetch("/api/documents?status=READY");
    const data = await res.json();
    setDocuments(data.data ?? []);
  }

  async function generateSet() {
    if (!selectedDoc) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: selectedDoc }),
      });
      const data = await res.json();
      if (data.data) {
        setSets((prev) => [data.data, ...prev]);
        setActiveSet(data.data);
        setCardIndex(0);
        setFlipped(false);
        setShowGen(false);
      }
    } finally {
      setIsGenerating(false);
    }
  }

  // Study mode
  if (activeSet) {
    const cards = activeSet.cards ?? [];
    const card = cards[cardIndex];
    const progress = ((cardIndex + 1) / cards.length) * 100;

    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <button onClick={() => setActiveSet(null)} className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Sets
          </button>
          <span className="text-sm text-muted-foreground">{cardIndex + 1} / {cards.length}</span>
        </div>

        <div className="mb-4 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>

        {/* Flashcard */}
        <div
          className="cursor-pointer"
          onClick={() => setFlipped((f) => !f)}
          style={{ perspective: "1000px" }}
        >
          <div
            className="relative h-64 transition-transform duration-500"
            style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
          >
            {/* Front */}
            <div className="absolute inset-0 rounded-2xl border-2 bg-card flex items-center justify-center p-8 text-center backface-hidden">
              <div>
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Question</p>
                <p className="text-lg font-medium">{card?.front}</p>
                <p className="mt-4 text-xs text-muted-foreground">Tap to reveal answer</p>
              </div>
            </div>
            {/* Back */}
            <div
              className="absolute inset-0 rounded-2xl border-2 border-primary bg-primary/5 flex items-center justify-center p-8 text-center"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <div>
                <p className="text-xs text-primary mb-3 uppercase tracking-wider font-medium">Answer</p>
                <p className="text-base leading-relaxed">{card?.back}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => { setCardIndex((i) => Math.max(0, i - 1)); setFlipped(false); }}
            disabled={cardIndex === 0}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <button onClick={() => setFlipped((f) => !f)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <RotateCcw className="h-3.5 w-3.5" /> Flip
          </button>
          {cardIndex < cards.length - 1 ? (
            <button
              onClick={() => { setCardIndex((i) => i + 1); setFlipped(false); }}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => { setCardIndex(0); setFlipped(false); }}
              className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              Restart <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Flashcards</h1>
          <p className="mt-1 text-muted-foreground">Active recall and spaced repetition</p>
        </div>
        <button
          onClick={() => setShowGen(!showGen)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Generate Set
        </button>
      </div>

      {showGen && (
        <div className="mb-8 rounded-xl border bg-card p-5 max-w-md space-y-4">
          <h2 className="font-semibold">Generate Flashcard Set</h2>
          <select
            value={selectedDoc}
            onChange={(e) => setSelectedDoc(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <option value="">Select a document...</option>
            {documents.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
          </select>
          <button
            onClick={generateSet}
            disabled={isGenerating || !selectedDoc}
            className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : "Generate 20 Flashcards"}
          </button>
        </div>
      )}

      {sets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Layers className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h2 className="font-semibold mb-1">No flashcard sets yet</h2>
          <p className="text-sm text-muted-foreground">Generate your first set from a document</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sets.map((set) => (
            <div key={set.id} className="rounded-xl border bg-card p-5 hover:shadow-sm transition-shadow">
              <Layers className="mb-3 h-6 w-6 text-primary" />
              <p className="font-semibold truncate">{set.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{set._count?.cards ?? set.cards?.length ?? 0} cards</p>
              <button
                onClick={() => { setActiveSet(set); setCardIndex(0); setFlipped(false); }}
                className="mt-4 w-full rounded-lg bg-primary/10 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
              >
                Study Now
              </button>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
    </div>
  );
}
