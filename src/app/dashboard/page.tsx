import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FileText, MessageSquare, CheckSquare,
  Layers, BarChart2, ArrowRight, Upload, Clock, Flame,
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
    { label: "Start AI chat", sub: "Ask questions about your documents", icon: MessageSquare, href: "/chat", color: "text-blue-400 bg-blue-400/10" },
    { label: "Take a quiz", sub: "Test your knowledge", icon: CheckSquare, href: "/quiz", color: "text-emerald-400 bg-emerald-400/10" },
    { label: "Review flashcards", sub: "Reinforce key concepts", icon: Layers, href: "/flashcards", color: "text-violet-400 bg-violet-400/10" },
    { label: "View analytics", sub: "Track your progress", icon: BarChart2, href: "/analytics", color: "text-primary bg-primary/10" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="flex items-center justify-between h-14 px-6 border-b border-border glass shrink-0">
        <h1 className="text-sm font-medium text-foreground">Dashboard</h1>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-secondary text-xs text-muted-foreground">
          <Flame className="h-3.5 w-3.5 text-primary" />
          <span className="font-medium text-primary">{analytics?.currentStreak ?? 0}</span>
          <span>day streak</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 fade-in">
        {/* Welcome */}
        <div>
          <h2 className="text-xl font-medium text-foreground">
            Welcome back, <span className="gold-text">{firstName}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Your AI learning environment is ready.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map(({ label, value, icon: Icon, href, sub }) => (
            <Link key={label} href={href} className="rounded-xl border border-border bg-card p-4 card-hover shimmer">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-medium text-foreground">{value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>
            </Link>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Recent Documents */}
          <div className="lg:col-span-3 rounded-xl border border-border bg-card card-hover">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-sm font-medium text-foreground">Recent documents</h3>
              <Link href="/upload" className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
                <Upload className="h-3.5 w-3.5" /> Add document
              </Link>
            </div>
            <div className="p-5">
              {documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 gold-glow">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">No documents yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Upload notes, textbooks, or slides to begin</p>
                  <Link href="/upload" className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-all duration-200 gold-glow">
                    <Upload className="h-3.5 w-3.5" /> Upload your first document
                  </Link>
                </div>
              ) : (
                <ul className="space-y-2">
                  {documents.map((doc) => (
                    <li key={doc.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-all duration-200 cursor-pointer">
                      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate text-foreground">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">{doc.subject}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${doc.status === "READY" ? "bg-emerald-400/10 text-emerald-400" : doc.status === "FAILED" ? "bg-red-400/10 text-red-400" : "bg-amber-400/10 text-amber-400"}`}>
                        {doc.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card card-hover">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-medium text-foreground">Quick actions</h3>
            </div>
            <div className="p-3 space-y-1">
              {quickActions.map(({ label, sub, icon: Icon, href, color }) => (
                <Link key={label} href={href} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-all duration-200 group">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
