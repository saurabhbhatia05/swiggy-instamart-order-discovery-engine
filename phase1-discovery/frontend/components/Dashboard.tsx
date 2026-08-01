"use client";

import { useEffect, useState } from "react";
import { LeftPanel } from "@/components/LeftPanel";
import { LiveWorkflowPanel } from "@/components/LiveWorkflowPanel";
import { RagChat } from "@/components/RagChat";

type Tab = "workflow" | "rag";

interface Stats {
  totalDocuments: number;
  sourceCount: number;
  brandMentions: number;
  sourceDistribution: { source: string; count: number }[];
}

const PAGE_SUMMARY =
  "AI-powered analysis of 3,000+ multi-source reviews to understand why users repeat the same categories, what blocks exploration, and how to drive new category discovery on Swiggy Instamart.";

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>("workflow");
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedQuestion, setSelectedQuestion] = useState("Q1");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load stats");
        return r.json();
      })
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : "Load failed"));
  }, []);

  const tabs: { id: Tab; label: string }[] = [
    { id: "workflow", label: "Live Workflow" },
    { id: "rag", label: "Research Chat (RAG)" },
  ];

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="shrink-0 border-b border-[var(--border)] bg-[var(--surface)] px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
          Phase 1 Discovery Engine
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Swiggy Instamart AI Powered Discovery
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
          {PAGE_SUMMARY}
        </p>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[35%_65%]">
        {stats && (
          <LeftPanel
            totalDocuments={stats.totalDocuments}
            sourceDistribution={stats.sourceDistribution}
            selectedSource={selectedSource}
            onSourceChange={setSelectedSource}
            selectedQuestion={selectedQuestion}
            onQuestionChange={setSelectedQuestion}
            showQuestionFilter={tab === "workflow"}
          />
        )}

        <div className="flex min-w-0 flex-col overflow-hidden">
          <nav className="flex shrink-0 gap-6 border-b border-[var(--border)] bg-[var(--bg)] px-6">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`py-3 text-sm ${tab === t.id ? "tab-active" : "tab-inactive"}`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <main className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
            {error && (
              <div className="mb-4 rounded-lg border border-red-800 bg-red-900/20 p-4 text-red-300">
                {error}
              </div>
            )}

            {!stats && !error && (
              <p className="text-[var(--muted)]">Loading corpus...</p>
            )}

            {stats && tab === "workflow" && (
              <LiveWorkflowPanel
                selectedSource={selectedSource}
                selectedQuestion={selectedQuestion}
              />
            )}

            {stats && tab === "rag" && (
              <RagChat sourceFilter={selectedSource} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
