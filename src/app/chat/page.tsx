// src/app/chat/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, BookOpen, Plus } from "lucide-react";
import { cn, formatRelativeDate } from "@/lib/utils";
import { ChatMessage, CitationSource } from "@/types";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const message = input.trim();
    if (!message || isLoading) return;

    setInput("");
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sessionId: sessionId ?? "",
      role: "USER",
      content: message,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sessionId: sessionId ?? "",
      role: "ASSISTANT",
      content: "",
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionId }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.sessionId && !sessionId) setSessionId(parsed.sessionId);
            if (parsed.content) {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: updated[updated.length - 1].content + parsed.content,
                };
                return updated;
              });
            }
            if (parsed.sources) {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  sources: parsed.sources,
                };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="font-semibold text-lg">AI Chat</h1>
          <p className="text-sm text-muted-foreground">Ask questions about your uploaded documents</p>
        </div>
        <button
          onClick={() => { setMessages([]); setSessionId(null); }}
          className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
        >
          <Plus className="h-4 w-4" /> New Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Your Academic Twin</h2>
            <p className="text-muted-foreground max-w-md">
              Ask me anything about your uploaded documents. I'll answer using your materials and cite my sources.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 max-w-lg w-full">
              {["Summarize Chapter 4", "What are the key concepts?", "Give me practice examples", "Compare these two topics"].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="rounded-lg border bg-card p-3 text-sm text-left hover:bg-muted transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex gap-3", msg.role === "USER" ? "flex-row-reverse" : "flex-row")}>
            <div className={cn(
              "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm",
              msg.role === "USER" ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
              {msg.role === "USER" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div className={cn("max-w-[70%] space-y-2", msg.role === "USER" ? "items-end" : "items-start")}>
              <div className={cn(
                "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "USER"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-muted text-foreground rounded-tl-sm"
              )}>
                {msg.content || (isLoading && msg.role === "ASSISTANT" && (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking...
                  </span>
                ))}
              </div>

              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> Sources
                  </p>
                  {msg.sources.map((s: CitationSource, i: number) => (
                    <div key={i} className="rounded-md border bg-card px-3 py-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{s.documentTitle}</span>
                      {s.pageNumber && <span> — Page {s.pageNumber}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-background px-6 py-4">
        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your documents..."
            className="flex-1 rounded-xl border bg-muted px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
