export const dynamic = "force-dynamic";
"use client";
import { useEffect, useState } from "react";
import { BarChart2, Clock, CheckSquare, FileText, MessageSquare, Layers, Flame, TrendingUp, Loader2 } from "lucide-react";

interface Analytics {
  totalStudyTime: number;
  documentsUploaded: number;
  quizzesCompleted: number;
  avgQuizScore: number;
  chatMessages: number;
  flashcardsReviewed: number;
  currentStreak: number;
  longestStreak: number;
}

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub: string; icon: any; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-2xl font-medium text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => setAnalytics(d.data ?? d.analytics ?? d))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (mins: number) => {
    if (!mins) return "0m";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-14 px-6 border-b border-border bg-card shrink-0">
        <BarChart2 className="h-4 w-4 text-muted-foreground mr-2" />
        <h1 className="text-sm font-medium text-foreground">Analytics</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h2 className="text-lg font-medium text-foreground">Your progress</h2>
            <p className="text-sm text-muted-foreground mt-1">Track your learning activity and performance over time.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard label="Study time" value={fmt(analytics?.totalStudyTime ?? 0)} sub="Total logged" icon={Clock} color="bg-blue-50 text-blue-600" />
                <StatCard label="Documents" value={analytics?.documentsUploaded ?? 0} sub="Uploaded" icon={FileText} color="bg-purple-50 text-purple-600" />
                <StatCard label="Quizzes" value={analytics?.quizzesCompleted ?? 0} sub="Completed" icon={CheckSquare} color="bg-green-50 text-green-600" />
                <StatCard label="Avg score" value={`${Math.round(analytics?.avgQuizScore ?? 0)}%`} sub="Quiz accuracy" icon={TrendingUp} color="bg-amber-50 text-amber-600" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <StatCard label="AI messages" value={analytics?.chatMessages ?? 0} sub="Sent to AI" icon={MessageSquare} color="bg-sky-50 text-sky-600" />
                <StatCard label="Flashcards" value={analytics?.flashcardsReviewed ?? 0} sub="Reviewed" icon={Layers} color="bg-pink-50 text-pink-600" />
                <StatCard label="Current streak" value={`${analytics?.currentStreak ?? 0} days`} sub={`Longest: ${analytics?.longestStreak ?? 0} days`} icon={Flame} color="bg-orange-50 text-orange-600" />
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-medium text-foreground mb-4">Activity summary</h3>
                <div className="space-y-3">
                  {[
                    { label: "Quiz accuracy", value: analytics?.avgQuizScore ?? 0, max: 100, color: "bg-green-500" },
                    { label: "Documents processed", value: Math.min((analytics?.documentsUploaded ?? 0) * 10, 100), max: 100, color: "bg-blue-500" },
                    { label: "Flashcards reviewed", value: Math.min((analytics?.flashcardsReviewed ?? 0), 100), max: 100, color: "bg-purple-500" },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-muted-foreground">{label}</span>
                        <span className="text-xs font-medium text-foreground">{Math.round(value)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${Math.min(value, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
