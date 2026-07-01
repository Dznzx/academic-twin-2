import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FileText, MessageSquare, CheckSquare,
  Layers, BarChart2, ArrowRight, Upload, Clock, Flame, NotebookPen,
} from "lucide-react";
import { formatDuration } from "@/lib/utils";

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/auth/login");

  const clerkUser = await currentUser();

  let user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId,
        email: clerkUser?.emailAddresses[0]?.emailAddress ?? "",
        name: clerkUser?.fullName ?? clerkUser?.firstName ?? "Student",
        avatar: clerkUser?.imageUrl,
      },
    });
  }

  const [documents, analytics] = await Promise.all([
    prisma.document.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.userAnalytics.findUnique({ where: { userId: user.id } }),
  ]);

  const firstName = user.name?.split(" ")[0] ?? "Student";

  const stats = [
    { label: "Documents", value: analytics?.documentsUploaded ?? 0, icon: FileText, href: "/upload", sub: "uploaded" },
    { label: "AI Chats", value: analytics?.chatMessages ?? 0, icon: MessageSquare, href: "/chat", sub: "messages" },
    { label: "Quizzes done", value: analytics?.quizzesCompleted ?? 0, icon: CheckSquare, href: "/quiz", sub: "completed" },
    { label: "Study time", value: formatDuration(analytics?.totalStudyTime ?? 0), icon: Clock, href: "/analytics", sub: "this week" },
  ];

  const quickActions = [
    { label: "Start AI chat", sub: "Ask questions about your documents", icon: MessageSquare, href: "/chat", iconColor: "text-blue-400", iconBg: "bg-blue-400/10" },
    { label: "Take a quiz", sub: "Test your knowledge", icon: CheckSquare, href: "/quiz", iconColor: "text-emerald-400", iconBg: "bg-emerald-400/10" },
    { label: "Review flashcards", sub: "Reinforce key concepts", icon: Layers, href: "/flashcards", iconColor: "text-violet-400", iconBg: "bg-violet-400/10" },
    { label: "Generate notes", sub: "AI-powered study notes", icon: NotebookPen, href: "/notes", iconColor: "text-cyan-400", iconBg: "bg-cyan-400/10" },
    { label: "View analytics", sub: "Track your progress", icon: BarChart2, href: "/analytics", iconColor: "text-amber-400", iconBg: "bg-amber-400/10" },
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: "#04060f" }}>
      <style>{`
        .stat-card:hover { border-color: rgba(91,127,255,0.25) !important; transform: translateY(-2px); }
        .doc-item:hover { background: rgba(255,255,255,0.03); }
        .action-item:hover { background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.06) !important; }
        .action-item:hover .action-arrow { opacity: 1; }
      `}</style>

      {/* Topbar */}
      <div className="flex items-center justify-between h-14 px-6 shrink-0" style={{ background: "rgba(8,12,24,0.85)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <h1 className="text-sm font-medium" style={{ color: "#eef0f8" }}>Dashboard</h1>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#7a82a0" }}>
          <Flame className="h-3.5 w-3.5" style={{ color: "#fbbf24" }} />
          <span className="font-medium" style={{ color: "#fbbf24" }}>{analytics?.currentStreak ?? 0}</span>
          <span>day streak</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Welcome */}
        <div>
          <h2 className="text-xl" style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, color: "#eef0f8" }}>
            Welcome back,{" "}
            <span style={{ background: "linear-gradient(135deg,#5b7fff,#22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {firstName}
            </span>
          </h2>
          <p className="text-sm mt-1" style={{ color: "#7a82a0" }}>Your AI learning environment is ready.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map(({ label, value, icon: Icon, href, sub }) => (
            <Link key={label} href={href} className="stat-card rounded-xl p-4 transition-all duration-300" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "#080c18" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#4a5070" }}>{label}</span>
                <Icon className="h-4 w-4" style={{ color: "#4a5070" }} />
              </div>
              <p className="text-2xl font-bold" style={{ fontFamily: "Syne, sans-serif", color: "#eef0f8" }}>{value}</p>
              <p className="text-[11px] mt-1" style={{ color: "#4a5070" }}>{sub}</p>
            </Link>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Recent Documents */}
          <div className="lg:col-span-3 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "#080c18" }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 className="text-sm font-medium" style={{ color: "#eef0f8" }}>Recent documents</h3>
              <Link href="/upload" className="flex items-center gap-1 text-xs transition-colors" style={{ color: "#5b7fff" }}>
                <Upload className="h-3.5 w-3.5" /> Add document
              </Link>
            </div>
            <div className="p-5">
              {documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center mb-3" style={{ background: "rgba(91,127,255,0.1)", boxShadow: "0 0 20px rgba(91,127,255,0.15)" }}>
                    <FileText className="h-5 w-5" style={{ color: "#5b7fff" }} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: "#eef0f8" }}>No documents yet</p>
                  <p className="text-xs mt-1" style={{ color: "#4a5070" }}>Upload notes, textbooks, or slides to begin</p>
                  <Link href="/upload" className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium" style={{ background: "linear-gradient(135deg,#5b7fff,#8b5cf6)", color: "#fff", boxShadow: "0 0 20px rgba(91,127,255,0.2)" }}>
                    <Upload className="h-3.5 w-3.5" /> Upload your first document
                  </Link>
                </div>
              ) : (
                <ul className="space-y-1">
                  {documents.map((doc) => (
                    <li key={doc.id} className="doc-item flex items-center gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer">
                      <div className="h-8 w-8 rounded-md flex items-center justify-center shrink-0" style={{ background: "rgba(91,127,255,0.1)" }}>
                        <FileText className="h-4 w-4" style={{ color: "#5b7fff" }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate" style={{ color: "#eef0f8" }}>{doc.title}</p>
                        <p className="text-xs" style={{ color: "#4a5070" }}>{doc.subject}</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={
                        doc.status === "READY"
                          ? { background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }
                          : doc.status === "FAILED"
                          ? { background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }
                          : { background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }
                      }>
                        {doc.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "#080c18" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 className="text-sm font-medium" style={{ color: "#eef0f8" }}>Quick actions</h3>
            </div>
            <div className="p-3 space-y-1">
              {quickActions.map(({ label, sub, icon: Icon, href, iconColor, iconBg }) => (
                <Link key={label} href={href} className="action-item flex items-center gap-3 p-3 rounded-lg transition-all duration-200" style={{ border: "1px solid transparent" }}>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium" style={{ color: "#eef0f8" }}>{label}</p>
                    <p className="text-xs" style={{ color: "#4a5070" }}>{sub}</p>
                  </div>
                  <ArrowRight className="action-arrow h-4 w-4 opacity-0 transition-opacity" style={{ color: "#4a5070" }} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
