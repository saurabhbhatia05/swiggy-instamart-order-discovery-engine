"use client";

import { useState } from "react";
import { formatSourceLabel } from "@/lib/sources";

interface RagMessage {
  role: "user" | "assistant";
  content: string;
}

interface RagChatProps {
  sourceFilter?: string;
}

export function RagChat({ sourceFilter = "all" }: RagChatProps) {
  const [messages, setMessages] = useState<RagMessage[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const sourceLabel =
    sourceFilter === "all" ? "all sources" : formatSourceLabel(sourceFilter);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMsg = query.trim();
    setQuery("");
    setMessages((m) => [...m, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg, source: sourceFilter }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.answer ?? "No response." },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Failed to query corpus." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card flex h-[calc(100vh-220px)] min-h-[320px] flex-col overflow-hidden">
      <p className="mb-3 shrink-0 text-sm text-[var(--muted)]">
        Research Chat (RAG) — keyword search over Swiggy Instamart reviews from{" "}
        <strong className="text-[var(--accent-soft)]">{sourceLabel}</strong>
      </p>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
        {messages.length === 0 && (
          <div className="space-y-2 text-sm text-[var(--muted)]">
            <p>Ask about category habits, trust barriers, discovery, or frustrations.</p>
            <p className="text-xs">Try: &quot;Why don&apos;t users explore personal care?&quot;</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`rounded-lg px-3 py-2 text-sm ${
              msg.role === "user"
                ? "ml-4 bg-orange-900/30 text-orange-100 sm:ml-8"
                : "mr-4 bg-slate-800 text-slate-200 sm:mr-8"
            }`}
          >
            <p className="mb-1 text-xs font-semibold uppercase opacity-60">{msg.role}</p>
            <div className="whitespace-pre-wrap break-words">{msg.content}</div>
          </div>
        ))}
        {loading && (
          <p className="text-sm text-[var(--muted)]">Searching {sourceLabel}...</p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-3 flex w-full min-w-0 shrink-0 items-center gap-2 border-t border-[var(--border)] pt-3"
      >
        <input
          className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          placeholder="Ask about habits, trust, discovery..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn-primary shrink-0 whitespace-nowrap" disabled={loading}>
          Send
        </button>
      </form>
    </div>
  );
}
