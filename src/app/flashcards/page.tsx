"use client";
import { useState, useEffect } from "react";
import { Layers, ChevronLeft, ChevronRight, RotateCcw, Loader2, CheckCircle, XCircle, Sparkles, FileText, ArrowLeft } from "lucide-react";

interface Flashcard { id: string; front: string; back: string; }
interface Deck { id: string; title: string; flashcards?: Flashcard[]; cards?: Flashcard[]; }
interface Doc { id: string; title: string; status: string; }

const CARD_COUNTS = [15, 25, 40, 60, 100];

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [selected, setSelected] = useState<Deck | null>(null);
  const [loadingDeck, setLoadingDeck] = useState(false);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);

  const [genDoc, setGenDoc] = useState<Doc | null>(null);
  const [genCount, setGenCount] = useState(15);

  const getCards = (deck: Deck) => deck.flashcards ?? deck.cards ?? [];

  const fetchAll = () => {
    Promise.all([
      fetch("/api/flashcards").then((r) => r.json()),
      fetch("/api/documents").then((r) => r.json()),
    ]).then(([deckData, docData]) => {
      setDecks(deckData.decks ?? deckData.sets ?? deckData.data ?? []);
      const docs = (docData.data ?? docData.documents ?? []).filter((d: Doc) => d.status === "READY");
      setDocuments(docs);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const openDeck = async (deckId: string) => {
    setLoadingDeck(true);
    try {
      const res = await fetch(`/api/flashcards/${deckId}`);
      const data = await res.json();
      setSelected(data.data ?? data.set ?? data);
      setIndex(0);
      setFlipped(false);
      setKnown(new Set());
    } catch {
      alert("Failed to load flashcards.");
    } finally {
      setLoadingDeck(false);
    }
  };

  const generateDeck = async () => {
    if (!genDoc) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: genDoc.id, count: genCount }),
      });
      if (res.ok) {
        fetchAll();
        setShowGenerate(false);
        setGenDoc(null);
      } else {
        alert("Failed to generate flashcards. Try again.");
      }
    } catch {
      alert("Something went wrong generating flashcards.");
    } finally {
      setGenerating(false);
    }
  };

  const reset = () => { setSelected(null); setIndex(0); setFlipped(false); setKnown(new Set()); };
  const next = () => { if (!selected) return; setIndex((p) => Math.min(p + 1, getCards(selected).length - 1)); setFlipped(false); };
  const prev = () => { setIndex((p) => Math.max(p - 1, 0)); setFlipped(false); };
  const markKnown = () => { setKnown((p) => new Set([...p, index])); next(); };
  const markUnknown = () => next();

  if (loading) return (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-14 px-6 border-b border-border glass shrink-0">
        <Layers className="h-4 w-4 text-muted-foreground mr-2" />
        <h1 className="text-sm font-medium text-foreground">Flashcards</h1>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    </div>
  );

  if (selected) {
    const cards = getCards(selected);
    const card = cards[index];
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-14 px-6 border-b border-border glass shrink-0">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <h1 className="text-sm font-medium text-foreground">{selected.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{index + 1}/{cards.length}</span>
            <span className="text-xs text-emerald-400 font-medium">{known.size} known</span>
            <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs text-muted-foreground hover:bg-secondary transition-colors">
              <RotateCcw className="h-3.5 w-3.5" /> Exit
            </button>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
          <div className="w-full max-w-lg">
            <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden mb-6">
              <div className="h-full bg-primary transition-all" style={{ width: `${((index + 1) / cards.length) * 100}%` }} />
            </div>
            <div onClick={() => setFlipped((f) => !f)} className="w-full min-h-[260px] rounded-2xl border border-border bg-card flex flex-col items-center justify-center p-8 cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all text-center select-none">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">{flipped ? "Answer" : "Question"}</p>
              <p className="text-base font-medium text-foreground leading-relaxed">{flipped ? card.back : card.front}</p>
              {!flipped && <p className="text-xs text-muted-foreground mt-6">Click to reveal answer</p>}
            </div>
          </div>
          {flipped && (
            <div className="flex gap-3">
              <button onClick={markUnknown} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-400/30 bg-red-400/10 text-red-400 text-sm font-medium hover:bg-red-400/20 transition-colors">
                <XCircle className="h-4 w-4" /> Still learning
              </button>
              <button onClick={markKnown} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 text-sm font-medium hover:bg-emerald-400/20 transition-colors">
                <CheckCircle className="h-4 w-4" /> Got it
              </button>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={prev} disabled={index === 0} className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-secondary disabled:opacity-40 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={next} disabled={index === cards.length - 1} className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-secondary disabled:opacity-40 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-14 px-6 border-b border-border glass shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <h1 className="text-sm font-medium text-foreground">Flashcards</h1>
        </div>
        <button onClick={() => { setShowGenerate((p) => !p); setGenDoc(null); }} disabled={documents.length === 0} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-40 transition-all duration-200">
          <Sparkles className="h-3.5 w-3.5" /> Generate deck
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <div>
            <h2 className="text-lg font-medium text-foreground">Your decks</h2>
            <p className="text-sm text-muted-foreground mt-1">Select a deck to start reviewing.</p>
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
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Number of flashcards</p>
                    <div className="flex gap-2">
                      {CARD_COUNTS.map((n) => (
                        <button key={n} onClick={() => setGenCount(n)} className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-all duration-200 ${genCount === n ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:border-primary/30"}`}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button onClick={generateDeck} disabled={generating} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-all duration-200 gold-glow">
                    {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate {genCount} flashcards</>}
                  </button>
                </>
              )}
            </div>
          )}

          {decks.length === 0 && !showGenerate ? (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-border bg-card">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 gold-glow">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">No flashcard decks yet</p>
              <p className="text-xs text-muted-foreground mt-1">Upload a document to generate flashcards automatically.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {decks.map((deck) => (
                <button key={deck.id} onClick={() => openDeck(deck.id)} disabled={loadingDeck} className="w-full flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 hover:border-primary/40 hover:shadow-sm transition-all text-left group disabled:opacity-60">
                  <div className="h-10 w-10 rounded-lg bg-violet-400/10 flex items-center justify-center shrink-0">
                    <Layers className="h-5 w-5 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{deck.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{getCards(deck).length} cards</p>
                  </div>
                  {loadingDeck ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
