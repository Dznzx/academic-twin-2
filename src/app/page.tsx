import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Brain, MessageSquare, CheckSquare, Layers, FileText, BarChart2, CalendarDays, ArrowRight, Sparkles } from "lucide-react";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  const features = [
    { icon: MessageSquare, title: "AI chat assistant", description: "Ask anything about your documents. Get cited, accurate answers instantly." },
    { icon: CheckSquare, title: "Quiz generator", description: "Auto-generate MCQ, short answer, and true/false quizzes from any doc." },
    { icon: Layers, title: "Flashcard sets", description: "Turn key concepts into flashcards for active recall and spaced repetition." },
    { icon: FileText, title: "Smart summaries", description: "Chapter summaries, key points, and formula sheets in seconds." },
    { icon: BarChart2, title: "Learning analytics", description: "Track your study time, quiz scores, weak topics, and streak." },
    { icon: CalendarDays, title: "Study planner", description: "AI-recommended daily schedules based on your performance and deadlines." },
  ];

  return (
    <div style={{ minHeight: "100vh", fontFamily: "Inter, sans-serif", background: "#0a0f1e", color: "#f1f5f9" }}>

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(10,15,30,0.85)", backdropFilter: "blur(12px)" }}>
        <div style={{ maxWidth: 1024, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Brain size={15} color="white" />
            </div>
            <span style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9" }}>Academic Twin</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/auth/login" style={{ fontSize: 14, color: "#94a3b8", textDecoration: "none", padding: "6px 12px" }}>Sign in</Link>
            <Link href="/auth/register" style={{ fontSize: 14, fontWeight: 500, background: "#6366f1", color: "white", textDecoration: "none", padding: "8px 16px", borderRadius: 8, display: "flex", alignItems: "center", gap: 6 }}>Get started free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "100px 24px 60px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(99,102,241,0.15)", color: "#818cf8", fontSize: 12, fontWeight: 500, padding: "5px 14px", borderRadius: 20, marginBottom: 28, border: "1px solid rgba(99,102,241,0.3)" }}>
          <Sparkles size={12} />Built for students, powered by AI
        </div>
        <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px", marginBottom: 20, color: "#f8fafc" }}>
          Study smarter with your{" "}
          <span style={{ color: "#818cf8" }}>personal AI tutor</span>
        </h1>
        <p style={{ fontSize: 18, color: "#94a3b8", lineHeight: 1.7, marginBottom: 36 }}>
          Upload your notes, textbooks, or slides and get an AI that knows your material. Chat, quiz yourself, make flashcards, and actually understand what you are studying.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/auth/register" style={{ display: "flex", alignItems: "center", gap: 8, background: "#6366f1", color: "white", textDecoration: "none", padding: "13px 30px", borderRadius: 12, fontSize: 15, fontWeight: 600 }}>
            Start for free <ArrowRight size={16} />
          </Link>
          <Link href="#features" style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", color: "#e2e8f0", textDecoration: "none", padding: "13px 30px", borderRadius: 12, fontSize: 15, fontWeight: 600, border: "1px solid rgba(255,255,255,0.1)" }}>
            See how it works
          </Link>
        </div>
      </section>

      {/* Stats */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth: 1024, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
          {[
            { val: "RAG", label: "Powered retrieval" },
            { val: "3", label: "Document formats" },
            { val: "6", label: "Study tools" },
            { val: "GPT-4o", label: "AI backbone" },
          ].map((s, i) => (
            <div key={s.label} style={{ padding: "28px 16px", textAlign: "center", borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#818cf8" }}>{s.val}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section id="features" style={{ maxWidth: 1024, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#818cf8", marginBottom: 12 }}>Features</div>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: "#f8fafc", marginBottom: 8 }}>Everything you need to ace your exams</h2>
        <p style={{ fontSize: 16, color: "#94a3b8", marginBottom: 40 }}>One place for all your study tools — powered by your own materials.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 22 }}>
              <div style={{ width: 38, height: 38, background: "rgba(99,102,241,0.15)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, color: "#818cf8" }}>
                <Icon size={18} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth: 1024, margin: "0 auto", padding: "80px 24px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#818cf8", marginBottom: 12 }}>How it works</div>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: "#f8fafc", marginBottom: 40 }}>From upload to mastery in minutes</h2>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden" }}>
            {[
              { num: "1", title: "Upload your materials", desc: "Add PDFs, lecture notes, or textbooks. Any academic document works." },
              { num: "2", title: "AI reads and indexes everything", desc: "Your documents get chunked, embedded, and stored for instant retrieval." },
              { num: "3", title: "Study interactively", desc: "Chat, take quizzes, review flashcards, and track your progress from one dashboard." },
            ].map(({ num, title, desc }, i) => (
              <div key={num} style={{ display: "flex", alignItems: "flex-start", gap: 20, padding: "22px 24px", borderTop: i > 0 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                <div style={{ minWidth: 32, height: 32, borderRadius: "50%", background: "#6366f1", color: "white", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{num}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <section style={{ padding: "0 24px 80px" }}>
        <div style={{ maxWidth: 1024, margin: "0 auto", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", borderRadius: 20, padding: "60px 32px", textAlign: "center" }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: "white", marginBottom: 12 }}>Ready to meet your Academic Twin?</h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, marginBottom: 28 }}>Free to start. No credit card needed.</p>
          <Link href="/auth/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "white", color: "#4f46e5", textDecoration: "none", padding: "13px 32px", borderRadius: 12, fontSize: 15, fontWeight: 700 }}>
            Create your account <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth: 1024, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#475569" }}>
            <Brain size={16} /> Academic Twin
          </div>
          <p style={{ fontSize: 12, color: "#475569" }}>Built with Next.js, Clerk, Supabase & Pinecone</p>
        </div>
      </footer>
    </div>
  );
}