// src/app/analytics/page.tsx
"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Flame, Trophy, BookOpen, Brain, TrendingUp, AlertCircle } from "lucide-react";
import { formatDuration } from "@/lib/utils";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => { setData(d.data); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  const stats = [
    { label: "Study Time", value: formatDuration(data?.totalStudyTime ?? 0), icon: TrendingUp, color: "text-blue-500" },
    { label: "Current Streak", value: `${data?.currentStreak ?? 0} days`, icon: Flame, color: "text-orange-500" },
    { label: "Avg Quiz Score", value: `${Math.round(data?.avgQuizScore ?? 0)}%`, icon: Trophy, color: "text-yellow-500" },
    { label: "Quizzes Done", value: data?.quizzesCompleted ?? 0, icon: BookOpen, color: "text-green-500" },
  ];

  // Prepare chart data from study sessions
  const sessionData = (data?.studySessions ?? []).slice(0, 14).reverse().map((s: any) => ({
    date: new Date(s.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
    minutes: s.duration,
  }));

  // Quiz performance
  const quizData = (data?.recentAttempts ?? []).slice(0, 8).reverse().map((a: any, i: number) => ({
    name: `Q${i + 1}`,
    score: Math.round(a.percentage),
  }));

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="mt-1 text-muted-foreground">Track your learning progress over time</p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Study sessions chart */}
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold mb-4">Study Time (last 14 days)</h2>
          {sessionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sessionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="m" />
                <Tooltip formatter={(v) => [`${v} min`, "Study time"]} />
                <Bar dataKey="minutes" fill="hsl(221 83% 53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No study sessions yet</div>
          )}
        </div>

        {/* Quiz scores chart */}
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold mb-4">Quiz Performance</h2>
          {quizData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={quizData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                <Tooltip formatter={(v) => [`${v}%`, "Score"]} />
                <Line type="monotone" dataKey="score" stroke="hsl(221 83% 53%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No quiz attempts yet</div>
          )}
        </div>
      </div>

      {/* Weak topics */}
      {(data?.weakTopics ?? []).length > 0 && (
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <h2 className="font-semibold">Topics to Improve</h2>
          </div>
          <div className="space-y-3">
            {data.weakTopics.map((t: any, i: number) => (
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{t.topic}</span>
                  <span className="text-muted-foreground">{Math.round(t.score)}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-orange-400 transition-all"
                    style={{ width: `${t.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
