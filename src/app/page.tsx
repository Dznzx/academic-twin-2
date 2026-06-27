// src/app/page.tsx
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  BookOpen, Brain, BarChart2, Zap, FileText,
  MessageSquare, CheckSquare, Layers, ArrowRight, Star
} from "lucide-react";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  const features = [
    { icon: MessageSquare, title: "AI Chat Assistant", description: "Ask questions about your uploaded documents and get accurate, cited answers powered by RAG." },
    { icon: CheckSquare, title: "Quiz Generator", description: "Auto-generate MCQ, short-answer, and true/false quizzes from any document." },
    { icon: Layers, title: "Flashcard Sets", description: "Convert key concepts into flashcards for active recall and spaced repetition." },
    { icon: FileText, title: "Smart Summaries", description: "Get chapter summaries, revision sheets, key points, and formula sheets instantly." },
    { icon: BarChart2, title: "Learning Analytics", description: "Track study time, quiz scores, weak topics, and your learning streak." },
    { icon: Zap, title: "Study Planner", description: "AI-recommended daily study schedules based on your performance and deadlines." },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Academic Twin</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
            <Star className="h-3.5 w-3.5 text-yellow-500" />
            AI-powered learning, built around your materials
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            Your Personal{" "}
            <span className="text-primary">Academic Twin</span>
          </h1>
          <p className="mb-10 text-xl text-muted-foreground leading-relaxed">
            Upload your lecture notes, textbooks, and assignments. Get an AI companion that answers questions from your materials, generates quizzes, creates flashcards, and tracks your progress.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
              Start Learning Free <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="#features" className="inline-flex items-center justify-center rounded-lg border px-8 py-3 text-base font-semibold hover:bg-muted transition-colors">
              See Features
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/40">
        <div className="container mx-auto grid grid-cols-2 gap-8 px-4 py-12 sm:grid-cols-4">
          {[
            { label: "Documents Processed", value: "RAG-powered" },
            { label: "Question Types", value: "3 formats" },
            { label: "AI Models", value: "GPT-4o" },
            { label: "Study Tools", value: "6 features" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-24">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Everything you need to study smarter</h2>
          <p className="mt-4 text-muted-foreground text-lg">
            All the tools a private tutor would bring — powered by your own materials.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/40">
        <div className="container mx-auto px-4 py-24">
          <h2 className="mb-16 text-center text-3xl font-bold tracking-tight">How it works</h2>
          <div className="mx-auto max-w-3xl space-y-8">
            {[
              { step: "01", title: "Upload your materials", description: "Add PDFs, lecture notes, textbooks, or any academic documents." },
              { step: "02", title: "AI processes & indexes", description: "Your documents are chunked, embedded, and stored in a vector database for instant retrieval." },
              { step: "03", title: "Learn interactively", description: "Chat with your materials, take AI-generated quizzes, review flashcards, and track your progress." },
            ].map(({ step, title, description }) => (
              <div key={step} className="flex gap-6">
                <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                  {step}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{title}</h3>
                  <p className="mt-1 text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to meet your Academic Twin?</h2>
        <p className="mb-8 text-muted-foreground text-lg">Start studying smarter today — no credit card required.</p>
        <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          Create Free Account <ArrowRight className="h-5 w-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto flex items-center justify-between px-4 py-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Brain className="h-4 w-4" />
            Academic Twin
          </div>
          <p className="text-sm text-muted-foreground">
            Built with Next.js, OpenAI, Pinecone & Prisma
          </p>
        </div>
      </footer>
    </div>
  );
}
