// src/app/study-planner/page.tsx
"use client";

import { useState } from "react";
import { CalendarDays, Plus, Clock, CheckCircle, Circle, AlertCircle } from "lucide-react";
import { Priority, TaskStatus } from "@/types";

const mockTasks = [
  { id: "1", title: "Review Chapter 5 — Machine Learning Basics", dueDate: new Date(), duration: 60, priority: "HIGH" as Priority, status: "PENDING" as TaskStatus, subject: "ML" },
  { id: "2", title: "Complete Linear Algebra practice problems", dueDate: new Date(), duration: 45, priority: "MEDIUM" as Priority, status: "IN_PROGRESS" as TaskStatus, subject: "Math" },
  { id: "3", title: "Revise Data Structures flashcards", dueDate: new Date(), duration: 30, priority: "LOW" as Priority, status: "COMPLETED" as TaskStatus, subject: "CS" },
];

const priorityColors: Record<Priority, string> = {
  HIGH: "text-red-600 bg-red-50",
  MEDIUM: "text-yellow-600 bg-yellow-50",
  LOW: "text-green-600 bg-green-50",
};

const statusIcons: Record<TaskStatus, React.ElementType> = {
  PENDING: Circle,
  IN_PROGRESS: AlertCircle,
  COMPLETED: CheckCircle,
};

const statusColors: Record<TaskStatus, string> = {
  PENDING: "text-muted-foreground",
  IN_PROGRESS: "text-blue-500",
  COMPLETED: "text-green-500",
};

export default function StudyPlannerPage() {
  const [tasks, setTasks] = useState(mockTasks);

  function toggleStatus(id: string) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next: Record<TaskStatus, TaskStatus> = {
          PENDING: "IN_PROGRESS",
          IN_PROGRESS: "COMPLETED",
          COMPLETED: "PENDING",
        };
        return { ...t, status: next[t.status] };
      })
    );
  }

  const today = tasks.filter((t) => t.status !== "COMPLETED");
  const done = tasks.filter((t) => t.status === "COMPLETED");
  const totalMinutes = today.reduce((s, t) => s + t.duration, 0);

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Study Planner</h1>
          <p className="mt-1 text-muted-foreground">
            {today.length} tasks remaining · {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m estimated
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Add Task
        </button>
      </div>

      {/* Today's tasks */}
      <div className="space-y-3 mb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Today</h2>
        {today.map((task) => {
          const StatusIcon = statusIcons[task.status];
          return (
            <div key={task.id} className="flex items-start gap-4 rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow">
              <button onClick={() => toggleStatus(task.id)} className={`mt-0.5 ${statusColors[task.status]}`}>
                <StatusIcon className="h-5 w-5" />
              </button>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${task.status === "COMPLETED" ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {task.duration}m
                  </span>
                  {task.subject && <span className="rounded-full bg-muted px-2 py-0.5">{task.subject}</span>}
                </div>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
            </div>
          );
        })}
      </div>

      {done.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Completed</h2>
          {done.map((task) => (
            <div key={task.id} className="flex items-center gap-4 rounded-xl border bg-muted/40 p-4 opacity-60">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <p className="text-sm line-through text-muted-foreground">{task.title}</p>
            </div>
          ))}
        </div>
      )}

      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <CalendarDays className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h2 className="font-semibold mb-1">No tasks planned</h2>
          <p className="text-sm text-muted-foreground">Add tasks to start planning your study schedule</p>
        </div>
      )}
    </div>
  );
}
