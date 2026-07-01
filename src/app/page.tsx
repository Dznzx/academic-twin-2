"use client";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div style={{ background: "#04060f", color: "#eef0f8", fontFamily: "Inter, sans-serif", overflowX: "hidden" }}>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 48px", background: "rgba(4,6,15,0.82)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#eef0f8" }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#5b7fff,#22d3ee)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 13, color: "#fff" }}>AT</div>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }}>Academic Twin</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {["Features", "How it works", "Pricing"].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`} style={{ fontSize: 13, color: "#7a82a0", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = "#eef0f8"}
              onMouseLeave={e => (e.target as HTMLElement).style.color = "#7a82a0"}
            >{item}</a>
          ))}
          <Link href="/auth/login" style={{ fontSize: 13, color: "#7a82a0", textDecoration: "none", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 14px", borderRadius: 8, transition: "all 0.2s" }}>Sign in</Link>
          <Link href="/auth/register" style={{ fontSize: 13, fontWeight: 500, padding: "8px 20px", borderRadius: 9, background: "linear-gradient(135deg,#5b7fff,#8b5cf6)", color: "#fff", textDecoration: "none", boxShadow: "0 0 28px rgba(91,127,255,0.25)" }}>Get started free</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px 60px", position: "relative", overflow: "hidden" }}>
        {/* Grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(91,127,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(91,127,255,0.03) 1px,transparent 1px)", backgroundSize: "60px 60px", maskImage: "radial-gradient(ellipse 70% 70% at 50% 40%,black,transparent)", pointerEvents: "none" }} />
        {/* Glow */}
        <div style={{ position: "absolute", width: 800, height: 600, top: "50%", left: "50%", transform: "translate(-50%,-60%)", background: "radial-gradient(ellipse,rgba(91,127,255,0.13) 0%,rgba(34,211,238,0.06) 40%,transparent 70%)", pointerEvents: "none" }} />

        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)", padding: "5px 14px", borderRadius: 100, background: "rgba(74,222,128,0.06)", marginBottom: 28 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
          Now in active development
        </div>

        <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(3rem,8vw,6.5rem)", fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 0.95, marginBottom: 24 }}>
          Study smarter.<br />
          <span style={{ background: "linear-gradient(135deg,#5b7fff,#22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Your AI twin.</span>
        </h1>

        <p style={{ fontSize: "clamp(1rem,1.8vw,1.15rem)", color: "#7a82a0", maxWidth: 480, margin: "0 auto 36px", lineHeight: 1.75, fontWeight: 300 }}>
          Upload your lecture notes, PDFs, or textbooks. Academic Twin reads them, understands them, and becomes your personal AI tutor — available 24/7.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 64 }}>
          <Link href="/auth/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 30px", borderRadius: 10, fontSize: 14, fontWeight: 500, background: "linear-gradient(135deg,#5b7fff,#8b5cf6)", color: "#fff", textDecoration: "none", boxShadow: "0 0 36px rgba(91,127,255,0.25)" }}>Get early access →</Link>
          <a href="#features" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 30px", borderRadius: 10, fontSize: 14, fontWeight: 500, background: "transparent", color: "#eef0f8", border: "1px solid rgba(255,255,255,0.12)", textDecoration: "none" }}>See features ↓</a>
        </div>

        {/* App mockup */}
        <div style={{ maxWidth: 860, width: "100%", position: "relative" }}>
          <div style={{ position: "absolute", inset: -40, background: "radial-gradient(ellipse at 50% 50%,rgba(91,127,255,0.18),transparent 65%)", filter: "blur(24px)", zIndex: 0 }} />
          <div style={{ position: "relative", zIndex: 1, borderRadius: 18, border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden", background: "#080c18", boxShadow: "0 48px 100px rgba(0,0,0,0.7)" }}>
            <div style={{ background: "#0d1220", padding: "12px 18px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
              <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 6, padding: "5px 14px", fontSize: 11, color: "#4a5070", textAlign: "center", margin: "0 16px" }}>app.academictwin.ai/chat</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "190px 1fr", height: 320 }}>
              <div style={{ borderRight: "1px solid rgba(255,255,255,0.06)", padding: 14, display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ fontSize: 10, color: "#4a5070", letterSpacing: "0.06em", textTransform: "uppercase", padding: "4px 10px", marginBottom: 4 }}>Navigation</div>
                {[
                  { icon: "💬", label: "AI Chat", active: true },
                  { icon: "📄", label: "Documents", active: false },
                  { icon: "🧠", label: "Quiz", active: false },
                  { icon: "🗂", label: "Flashcards", active: false },
                  { icon: "📊", label: "Analytics", active: false },
                  { icon: "📅", label: "Planner", active: false },
                ].map(({ icon, label, active }) => (
                  <div key={label} style={{ padding: "8px 12px", borderRadius: 8, fontSize: 12, color: active ? "#5b7fff" : "#7a82a0", background: active ? "rgba(91,127,255,0.12)" : "transparent", display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{icon}</span> {label}
                  </div>
                ))}
              </div>
              <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10, overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", borderRadius: 12, fontSize: 12, lineHeight: 1.6, maxWidth: "82%", background: "rgba(91,127,255,0.1)", border: "1px solid rgba(91,127,255,0.15)", color: "#eef0f8", alignSelf: "flex-start" }}>
                  <span style={{ color: "#5b7fff" }}>✦ </span>I've processed your Organic Chemistry PDF. What would you like to explore?
                </div>
                <div style={{ padding: "10px 14px", borderRadius: 12, fontSize: 12, lineHeight: 1.6, maxWidth: "82%", background: "linear-gradient(135deg,#5b7fff,#8b5cf6)", color: "#fff", alignSelf: "flex-end" }}>
                  Explain nucleophilic substitution
                </div>
                <div style={{ padding: "10px 14px", borderRadius: 12, fontSize: 12, lineHeight: 1.6, maxWidth: "82%", background: "rgba(91,127,255,0.1)", border: "1px solid rgba(91,127,255,0.15)", color: "#eef0f8", alignSelf: "flex-start" }}>
                  <span style={{ color: "#5b7fff" }}>✦ </span>In SN2 reactions, a nucleophile attacks from the back, inverting stereochemistry. Your notes on page 12 cover this with diagrams.
                </div>
                <div style={{ marginTop: "auto", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#4a5070", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Ask anything from your documents...</span>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg,#5b7fff,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff" }}>↑</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <div style={{ background: "#080c18", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "24px 48px", display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
        {[
          { val: "RAG", label: "Grounded in your\nown notes" },
          { val: "24/7", label: "AI tutor\navailability" },
          { val: "<60s", label: "Upload to first\nAI answer" },
          { val: "₹50", label: "Pro plan\nper month" },
        ].map(({ val, label }, i, arr) => (
          <div key={val} style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 48px", borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
            <div>
              <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.03em", background: "linear-gradient(135deg,#eef0f8,#7a82a0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{val}</div>
              <div style={{ fontSize: 12, color: "#4a5070", fontWeight: 300, lineHeight: 1.4, whiteSpace: "pre-line" }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <div id="features">
        {[
          {
            label: "AI Document Chat",
            title: "Answers from\nyour own notes.",
            sub: "Ask anything in plain English. Academic Twin searches your uploaded materials using vector embeddings, then generates a grounded, cited answer — not generic internet content.",
            points: ["Semantic search across all uploaded documents", "Answers cite which page and document they came from", "Understands context across chapters and subjects", "Supports PDFs, lecture slides, notes, research papers"],
            flip: false,
          },
          {
            label: "Auto Quiz Generation",
            title: "Test yourself\nin seconds.",
            sub: "Stop writing practice questions by hand. Academic Twin generates MCQ, short-answer, and true/false questions dynamically from any document.",
            points: ["Multiple choice, short answer, and true/false formats", "Difficulty slider — from easy to exam-hard", "Focus on specific topics or entire chapters", "Instant feedback with explanations from your notes"],
            flip: true,
          },
          {
            label: "Learning Analytics",
            title: "Know exactly\nwhere you stand.",
            sub: "Academic Twin tracks every quiz, session, and interaction. Your dashboard shows where you're strong, where you're struggling, and what to study next.",
            points: ["Topic-by-topic strength and weakness mapping", "Study streak and consistency tracking", "Quiz performance trends over time", "AI-generated daily revision recommendations"],
            flip: false,
          },
        ].map(({ label, title, sub, points, flip }) => (
          <div key={label} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center", padding: "80px 48px", borderBottom: "1px solid rgba(255,255,255,0.06)", direction: flip ? "rtl" : "ltr" }}>
            <div style={{ direction: "ltr" }}>
              <span style={{ display: "block", fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#5b7fff", marginBottom: 14 }}>{label}</span>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 12, whiteSpace: "pre-line" }}>{title}</h2>
              <p style={{ fontSize: "1rem", color: "#7a82a0", lineHeight: 1.75, fontWeight: 300, maxWidth: 400 }}>{sub}</p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
                {points.map((p) => (
                  <li key={p} style={{ fontSize: "0.875rem", color: "#7a82a0", display: "flex", alignItems: "flex-start", gap: 10, lineHeight: 1.6 }}>
                    <span style={{ color: "#5b7fff", flexShrink: 0, marginTop: 1 }}>→</span>{p}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ direction: "ltr", borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)", background: "#080c18", overflow: "hidden", position: "relative", padding: 28 }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%,rgba(91,127,255,0.06),transparent 60%)", pointerEvents: "none" }} />
              <div style={{ position: "relative", zIndex: 1, fontSize: 13, color: "#7a82a0", lineHeight: 1.6 }}>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#eef0f8", marginBottom: 12 }}>{label} preview</div>
                {points.slice(0, 3).map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, padding: "10px 12px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(91,127,255,0.04)" }}>
                    <span style={{ color: "#5b7fff" }}>✓</span>
                    <span style={{ fontSize: 12 }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ background: "#080c18", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "120px 48px" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span style={{ display: "block", fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#5b7fff", marginBottom: 14 }}>How it works</span>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(2.2rem,4vw,3.2rem)", fontWeight: 800, letterSpacing: "-0.04em" }}>From upload to insight<br />in under 60 seconds.</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "rgba(255,255,255,0.06)", borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
          {[
            { n: "01", title: "Upload your materials", desc: "Drop any PDF, lecture note, textbook, or assignment. Multiple files, multiple subjects — all organized automatically." },
            { n: "02", title: "AI builds your knowledge base", desc: "We extract, chunk, and embed your content into a personal vector database. Your documents become searchable semantic memory." },
            { n: "03", title: "Chat, quiz & learn", desc: "Ask questions, generate quizzes, create flashcards, and get summaries — all grounded in your own uploaded material." },
            { n: "04", title: "Track & improve", desc: "Your AI twin learns your study habits, identifies weak topics, and builds a personalized revision plan that actually works." },
          ].map(({ n, title, desc }) => (
            <div key={n} style={{ background: "#04060f", padding: "36px 28px", transition: "background 0.3s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#0d1220"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#04060f"}
            >
              <span style={{ fontFamily: "Syne, sans-serif", fontSize: "3rem", fontWeight: 800, letterSpacing: "-0.05em", color: "rgba(91,127,255,0.1)", display: "block", marginBottom: 16 }}>{n}</span>
              <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1rem", fontWeight: 700, marginBottom: 8 }}>{title}</div>
              <p style={{ fontSize: "0.825rem", color: "#7a82a0", lineHeight: 1.65, fontWeight: 300 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "120px 48px", textAlign: "center" }}>
        <span style={{ display: "block", fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#5b7fff", marginBottom: 14 }}>Pricing</span>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(2.2rem,4vw,3.2rem)", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 12 }}>Simple, honest pricing.</h2>
        <p style={{ color: "#7a82a0", fontWeight: 300, maxWidth: 380, margin: "0 auto 32px" }}>Start free. Upgrade when you need more. Cancel anytime.</p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 48, padding: "12px 24px", background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: 100, fontSize: 12, color: "#fbbf24" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fbbf24", display: "inline-block" }} />
          Early bird pricing — locked in for life when you join now
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, maxWidth: 720, margin: "0 auto", background: "rgba(255,255,255,0.06)", borderRadius: 24, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ background: "#04060f", padding: 40, textAlign: "left" }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4a5070", marginBottom: 16 }}>Free forever</div>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: "3rem", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 4 }}>₹0 <span style={{ fontSize: "1rem", fontWeight: 400, color: "#4a5070" }}>/ month</span></div>
            <div style={{ fontSize: "0.8rem", color: "#4a5070", marginBottom: 28, fontWeight: 300 }}>No credit card needed</div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {["3 document uploads", "50 AI chat messages / month", "Basic quiz generation", "Flashcard creation"].map((item) => (
                <li key={item} style={{ fontSize: "0.85rem", color: "#7a82a0", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "#4ade80", fontWeight: 700 }}>✓</span>{item}
                </li>
              ))}
              {["Advanced analytics", "Adaptive study planner", "Unlimited uploads"].map((item) => (
                <li key={item} style={{ fontSize: "0.85rem", color: "#4a5070", display: "flex", alignItems: "center", gap: 10, opacity: 0.35 }}>
                  <span>✕</span>{item}
                </li>
              ))}
            </ul>
            <Link href="/auth/register" style={{ display: "block", textAlign: "center", padding: "12px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", color: "#eef0f8", textDecoration: "none", fontSize: 14 }}>Get started free</Link>
          </div>
          <div style={{ background: "linear-gradient(160deg,rgba(91,127,255,0.09),#04060f)", padding: 40, textAlign: "left", position: "relative" }}>
            <div style={{ position: "absolute", top: 20, right: 20, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 12px", borderRadius: 100, background: "linear-gradient(135deg,#5b7fff,#8b5cf6)", color: "#fff" }}>Most popular</div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4a5070", marginBottom: 16 }}>Pro</div>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: "3rem", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 4 }}>₹50 <span style={{ fontSize: "1rem", fontWeight: 400, color: "#4a5070" }}>/ month</span></div>
            <div style={{ fontSize: "0.8rem", color: "#4a5070", marginBottom: 28, fontWeight: 300 }}>~$0.60 USD · cancel anytime</div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {["Unlimited document uploads", "Unlimited AI chat", "Advanced quiz generation", "Smart flashcard decks", "Full analytics dashboard", "Adaptive study planner", "Priority AI responses"].map((item) => (
                <li key={item} style={{ fontSize: "0.85rem", color: "#7a82a0", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "#4ade80", fontWeight: 700 }}>✓</span>{item}
                </li>
              ))}
            </ul>
            <Link href="/auth/register" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 10, background: "linear-gradient(135deg,#5b7fff,#8b5cf6)", color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 500, boxShadow: "0 0 36px rgba(91,127,255,0.25)" }}>Start free trial →</Link>
          </div>
        </div>
      </section>

      {/* CTA BOTTOM */}
      <section style={{ padding: "160px 48px", textAlign: "center", position: "relative", overflow: "hidden", background: "#080c18", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 60% at 50% 50%,rgba(91,127,255,0.09),transparent 70%)", pointerEvents: "none" }} />
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(2.5rem,6vw,5.5rem)", fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 0.95, marginBottom: 20, position: "relative", zIndex: 1 }}>
          Your AI twin is<br />
          <span style={{ background: "linear-gradient(135deg,#5b7fff,#22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>waiting for you.</span>
        </h2>
        <p style={{ fontSize: "1.05rem", color: "#7a82a0", marginBottom: 40, fontWeight: 300, position: "relative", zIndex: 1 }}>Stop studying hard. Start studying smart.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", position: "relative", zIndex: 1 }}>
          <Link href="/auth/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 30px", borderRadius: 10, fontSize: 14, fontWeight: 500, background: "linear-gradient(135deg,#5b7fff,#8b5cf6)", color: "#fff", textDecoration: "none", boxShadow: "0 0 36px rgba(91,127,255,0.25)" }}>Get early access →</Link>
          <Link href="/auth/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 30px", borderRadius: 10, fontSize: 14, fontWeight: 500, background: "transparent", color: "#eef0f8", border: "1px solid rgba(255,255,255,0.12)", textDecoration: "none" }}>Sign in →</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "32px 48px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#04060f" }}>
        <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 13, color: "#4a5070" }}>Academic Twin by Veltron</span>
        <div style={{ display: "flex", gap: 24 }}>
          {["Features", "How it works", "Pricing"].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`} style={{ fontSize: 12, color: "#4a5070", textDecoration: "none" }}>{item}</a>
          ))}
        </div>
        <span style={{ fontSize: 12, color: "#4a5070" }}>© 2025 Veltron Group</span>
      </footer>
    </div>
  );
}
