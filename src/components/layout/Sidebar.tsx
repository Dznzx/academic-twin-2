"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard, FileText, MessageSquare, CheckSquare,
  Layers, BarChart2, CalendarDays, Brain, NotebookPen,
} from "lucide-react";

const navSections = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/upload", icon: FileText, label: "Documents" },
      { href: "/chat", icon: MessageSquare, label: "AI Chat" },
    ],
  },
  {
    label: "Study Tools",
    items: [
      { href: "/quiz", icon: CheckSquare, label: "Quizzes" },
      { href: "/flashcards", icon: Layers, label: "Flashcards" },
      { href: "/notes", icon: NotebookPen, label: "Notes" },
      { href: "/study-planner", icon: CalendarDays, label: "Study Planner" },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/analytics", icon: BarChart2, label: "Analytics" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 flex-col border-r border-border glass">
      <div className="flex h-14 items-center gap-3 border-b border-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary gold-glow">
          <Brain className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium leading-none text-foreground">Academic Twin</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">AI Learning Platform</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navSections.map((section) => (
          <div key={section.label} className="slide-in">
            <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-200 ${
                        active
                          ? "bg-primary/15 text-primary font-medium gold-border border border-primary/20"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent"
                      }`}
                    >
                      <Icon className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${active ? "text-primary" : ""}`} />
                      {label}
                      {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-secondary transition-all duration-200 cursor-pointer">
          <UserButton afterSignOutUrl="/" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate text-foreground">My Account</p>
            <p className="text-[11px] text-muted-foreground">Settings & profile</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
