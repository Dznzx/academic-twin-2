// src/app/dashboard/page.tsx
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FileText, MessageSquare, CheckSquare, Layers,
  BarChart2, Flame, TrendingUp, Plus, ArrowRight
} from "lucide-react";
import { formatDuration } from "@/lib/utils";

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/auth/login");

  const clerkUser = await currentUser();

  // Ensure user exists in DB
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

  // Fetch data
  const [documents, analytics, recentAttempts, recentSessions] = await Promise.all([
    prisma.document.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.userAnalytics.findUnique({
      where: { userId: user.id },
    }),
    prisma.quizAttempt.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: "desc" },
      take: 3,
      include: { quiz: { select: { title: true } } },
    }),
    prisma.chatSession.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 3,
    }),
  ]);

  const stats = [
    { label: "Documents", value: analytics?.documentsUploaded ?? 0, icon: FileText, href: "/upload", color: "text-blue-500 bg-blue-50" },
    { label: "Chats", value: analytics?.chatMessages ?? 0, icon: MessageSquare, href: "/chat", color: "text-purple-500 bg-purple-50" },
    { label: "Quizzes done", value: analytics?.quizzesCompleted ?? 0, icon: CheckSquare, href: "/quiz", color: "text-green-500 bg-green-50" },
    { label: "Study time", value: formatDuration(analytics?.totalStudyTime ?? 0), icon: BarChart2, href: "/analytics", color: "text-orange-500 bg-orange-50" },
  ];

  const firstName = user.name?.split(" ")[0] ?? "Student";

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {firstName} 👋</h1>
          <p className="text-muted-foreground mt-1">Your academic twin is ready to help.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <span className="font-semibold">{analytics?.currentStreak ?? 0}</span>
          <span className="text-sm text-muted-foreground">day streak</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href} className="rounded-xl border bg-card p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Documents */}
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-semibold">Recent Documents</h2>
            <Link href="/upload" className="flex items-center gap-1 text-sm text-primary hover:underline">
              <Plus className="h-3.5 w-3.5" /> Add
            </Link>
          </div>
          <div className="divide-y">
            {documents.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No documents yet.</p>
                <Link href="/upload" className="mt-2 inline-block text-sm text-primary hover:underline">Upload your first document</Link>
              </div>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 px-5 py-3">
                  <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">{doc.status}</p>
                  </div>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${doc.status === "READY" ? "bg-green-50 text-green-700" : doc.status === "FAILED" ? "bg-red-50 text-red-700" : "bg-yellow-50 text-yellow-700"}`}>
                    {doc.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card">
            <div className="border-b px-5 py-4">
              <h2 className="font-semibold">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4">
              {[
                { href: "/chat", icon: MessageSquare, label: "Start Chat", description: "Ask your documents" },
                { href: "/quiz", icon: CheckSquare, label: "Take Quiz", description: "Test your knowledge" },
                { href: "/flashcards", icon: Layers, label: "Flashcards", description: "Review key concepts" },
                { href: "/analytics", icon: TrendingUp, label: "Analytics", description: "Track progress" },
              ].map(({ href, icon: Icon, label, description }) => (
                <Link key={href} href={href} className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted transition-colors">
                  <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quiz score summary */}
          {analytics && analytics.quizzesCompleted > 0 && (
            <div className="rounded-xl border bg-card px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Average Quiz Score</h3>
                <Link href="/quiz" className="text-xs text-primary flex items-center gap-0.5 hover:underline">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold">{Math.round(analytics.avgQuizScore)}%</span>
                <span className="text-sm text-muted-foreground mb-1">across {analytics.quizzesCompleted} quizzes</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.round(analytics.avgQuizScore)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
