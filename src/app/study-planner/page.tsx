import { useState, useEffect } from "react";
import { CalendarDays, Plus, Trash2, CheckCircle, Circle, Loader2 } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH";
}

interface Plan {
  id: string;
  title: string;
  tasks: Task[];
}

const priorityConfig = {
  HIGH: { label: "High", className: "bg-red-400/10 text-red-400 border-red-400/30" },
  MEDIUM: { label: "Medium", className: "bg-amber-400/10 text-amber-400 border-amber-400/30" },
  LOW: { label: "Low", className: "bg-emerald-400/10 text-emerald-400 border-emerald-400/30" },
};

export default function StudyPlannerPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");

  const fetchPlans = () => {
    fetch("/api/study-planner")
      .then((r) => r.json())
      .then((d) => setPlans(d.data ?? d.plans ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPlans(); }, []);

  const tasks: Task[] = plans.flatMap((p) => p.tasks ?? []);

  const addTask = async () => {
    if (!title.trim()) return;
    const res = await fetch("/api/study-planner/quick-task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, dueDate, priority }),
    });
    if (res.ok) {
      fetchPlans();
      setTitle(""); setDescription(""); setDueDate(""); setPriority("MEDIUM"); setAdding(false);
    } else {
      alert("Failed to add task.");
    }
  };

  const toggleTask = async (task: Task) => {
    await fetch(`/api/study-planner/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: task.status === "COMPLETED" ? "PENDING" : "COMPLETED" }),
    });
    fetchPlans();
  };

  const deleteTask = async (id: string) => {
    await fetch(`/api/study-planner/tasks/${id}`, { method: "DELETE" });
    fetchPlans();
  };

  const pending = tasks.filter((t) => t.status !== "COMPLETED");
  const completed = tasks.filter((t) => t.status === "COMPLETED");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-14 px-6 border-b border-border glass shrink-0">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <h1 className="text-sm font-medium text-foreground">Study Planner</h1>
        </div>
        <button onClick={() => setAdding((p) => !p)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-all duration-200">
          <Plus className="h-3.5 w-3.5" /> Add task
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-5">

          {adding && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
              <h3 className="text-sm font-medium text-foreground">New task</h3>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title..."
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)..."
                rows={2}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                >
                  <option value="LOW">Low priority</option>
                  <option value="MEDIUM">Medium priority</option>
                  <option value="HIGH">High priority</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setAdding(false)} className="px-3 py-1.5 rounded-md border border-border text-xs text-muted-foreground hover:bg-secondary transition-colors">Cancel</button>
                <button onClick={addTask} disabled={!title.trim()} className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors">Add task</button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-border bg-card">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 gold-glow">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">No tasks yet</p>
              <p className="text-xs text-muted-foreground mt-1">Add a study task to get organized.</p>
            </div>
          ) : (
            <>
              {pending.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Pending · {pending.length}</p>
                  <div className="space-y-2">
                    {pending.map((task) => (
                      <div key={task.id} className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 group">
                        <button onClick={() => toggleTask(task)} className="shrink-0 text-muted-foreground hover:text-primary transition-colors mt-0.5">
                          <Circle className="h-4 w-4" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground font-medium">{task.title}</p>
                          {task.description && <p className="text-xs text-muted-foreground/80 mt-0.5">{task.description}</p>}
                          {task.dueDate && <p className="text-xs text-muted-foreground mt-0.5">Due {new Date(task.dueDate).toLocaleDateString()}</p>}
                        </div>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${priorityConfig[task.priority]?.className ?? priorityConfig.MEDIUM.className}`}>
                          {priorityConfig[task.priority]?.label ?? "Medium"}
                        </span>
                        <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400 shrink-0">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {completed.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Completed · {completed.length}</p>
                  <div className="space-y-2">
                    {completed.map((task) => (
                      <div key={task.id} className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 opacity-60 group">
                        <button onClick={() => toggleTask(task)} className="shrink-0 text-emerald-400 mt-0.5">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground line-through">{task.title}</p>
                          {task.description && <p className="text-xs text-muted-foreground/60 mt-0.5 line-through">{task.description}</p>}
                        </div>
                        <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400 shrink-0">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
