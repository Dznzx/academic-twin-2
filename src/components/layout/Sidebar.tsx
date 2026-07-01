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
    <aside className="flex h-full w-56 flex-col border-r glass" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 px-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "linear-gradient(135deg,#5b7fff,#22d3ee)", boxShadow: "0 0 20px rgba(91,127,255,0.4)" }}>
          <Brain className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none" style={{ fontFamily: "Syne, sans-serif", color: "#eef0f8" }}>Academic Twin</p>
          <p className="text-[10px] mt-0.5" style={{ color: "#7a82a0" }}>AI Learning Platform</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#4a5070" }}>
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-200"
                      style={active ? {
                        background: "rgba(91,127,255,0.12)",
                        color: "#5b7fff",
                        fontWeight: 500,
                        border: "1px solid rgba(91,127,255,0.2)",
                      } : {
                        color: "#7a82a0",
                        border: "1px solid transparent",
                      }}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {label}
                      {active && <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: "#5b7fff" }} />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 cursor-pointer transition-all duration-200 hover:bg-white/5">
          <UserButton afterSignOutUrl="/" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "#eef0f8" }}>My Account</p>
            <p className="text-[11px]" style={{ color: "#7a82a0" }}>Settings & profile</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
