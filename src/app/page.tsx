import Link from "next/link";
import { Brain, ArrowRight, FileText, MessageSquare, CheckSquare, Layers, BarChart2, CalendarDays } from "lucide-react";

const features = [
  { icon: MessageSquare, label: "AI chat", desc: "Ask questions directly about your uploaded documents and get instant, accurate answers.", color: "bg-blue-50 text-blue-600" },
  { icon: CheckSquare, label: "Smart quizzes", desc: "Auto-generated quizzes from your content. Test yourself and track weak areas.", color: "bg-green-50 text-green-600" },
  { icon: Layers, label: "Flashcards", desc: "AI-generated flashcard decks from your notes for efficient spaced repetition.", color: "bg-purple-50 text-purple-600" },
  { icon: CalendarDays, label: "Study planner", desc: "Structured study plans built around your documents and exam dates.", color: "bg-amber-50 text-amber-600" },
  { icon: BarChart2, label: "Analytics", desc: "Track study time, quiz scores, and progress across all your subjects.", color: "bg-teal-50 text-teal-600" },
  { icon: FileText, label: "Document upload", desc: "Support for PDFs, slides, and text files. Your AI learns from your exact materials.", color: "bg-red-50 text-red-600" },
];

const steps = [
  { n: "1", title: "Upload your material", desc: "Drop in any PDF, slide deck, or notes. Your AI twin reads and indexes everything." },
  { n: "2", title: "Chat, quiz, and review", desc: "Ask questions, generate quizzes, or build flashcard decks — all from your documents." },
  { n: "3", title: "Track your progress", desc: "See what you know and where to focus. Study smarter, not harder." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-20 flex items-center h-14 px-8 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 flex-1">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
            <Brain className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-medium text-foreground">Academic Twin</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 mr-8">
          {["Features", "How it works", "Pricing"].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/auth/login" className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            Sign in
          </Link>
          <Link href="/auth/register" className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Get started free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted text-xs text-muted-foreground mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Built for students, powered by AI
        </div>
        <h1 className="text-5xl font-medium tracking-tight text-foreground leading-tight mb-6">
          Study smarter with your<br />
          <span className="text-primary">personal AI tutor</span>
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-xl mx-auto mb-10">
          Upload your notes, textbooks, or slides and get an AI that knows your material. Chat, quiz yourself, make flashcards, and actually understand what you are studying.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/auth/register" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Start for free <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#how-it-works" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors">
            See how it works
          </a>
        </div>
      </section>

      {/* Stats */}
      <div className="border-y border-border bg-card">
        <div className="max-w-4xl mx-auto grid grid-cols-4 divide-x divide-border">
          {[
            { val: "RAG", label: "Powered retrieval" },
            { val: "3", label: "Document formats" },
            { val: "6", label: "Study tools" },
            { val: "GPT-4o", label: "AI backbone" },
          ].map(({ val, label }) => (
            <div key={label} className="py-8 text-center">
              <p className="text-lg font-medium text-primary">{val}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section id="features" className="max-w-4xl mx-auto px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Features</p>
        <h2 className="text-2xl font-medium text-foreground mb-2">Everything you need to ace your exams</h2>
        <p className="text-sm text-muted-foreground mb-10">One place for all your study tools — powered by your own materials.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, label, desc, color }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-5">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center mb-4 ${color}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1.5">{label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-y border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 text-center">How it works</p>
          <h2 className="text-2xl font-medium text-foreground mb-12 text-center">Three steps to study smarter</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-border">
            {steps.map(({ n, title, desc }) => (
              <div key={n} className="px-8 py-6 first:pl-0 last:pr-0">
                <div className="h-7 w-7 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary mb-4">{n}</div>
                <p className="text-sm font-medium text-foreground mb-2">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="text-2xl font-medium text-foreground mb-3">Ready to study smarter?</h2>
        <p className="text-sm text-muted-foreground mb-8">Join students who are already using Academic Twin to ace their exams.</p>
        <Link href="/auth/register" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          Get started free <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-5 w-5 rounded-md bg-primary flex items-center justify-center">
              <Brain className="h-3 w-3 text-primary-foreground" />
            </div>
            Academic Twin
          </div>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Contact"].map((item) => (
              <a key={item} href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
