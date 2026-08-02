"use client";

import { useCallback, useEffect, useState } from "react";
import { formatSourceLabel } from "@/lib/sources";

interface EvidenceQuote {
  source_type: string;
  excerpt: string;
}

interface ResearchAnswer {
  id: string;
  question: string;
  answer: string;
  insight: string;
  evidenceCount: number;
  confidence: "high" | "medium" | "low";
  topThemes: { label: string; count: number }[];
  sourceBreakdown: { source: string; count: number }[];
  sampleQuotes: EvidenceQuote[];
}

const CONFIDENCE_CLASS: Record<string, string> = {
  high: "badge-high",
  medium: "badge-medium",
  low: "badge-low",
};

interface ResearchQuestionsPanelProps {
  sourceFilter?: string;
  selectedQuestion?: string;
  analysisKey?: number;
}

export function ResearchQuestionsPanel({
  sourceFilter = "all",
  selectedQuestion = "Q1",
  analysisKey = 0,
}: ResearchQuestionsPanelProps) {
  const [item, setItem] = useState<ResearchAnswer | null>(null);
  const [corpusSize, setCorpusSize] = useState(0);
  const [totalCorpusSize, setTotalCorpusSize] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<string | null>(null);

  const sourceLabel =
    sourceFilter === "all" ? "all sources" : formatSourceLabel(sourceFilter);

  const runAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: sourceFilter, question: selectedQuestion }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Analysis failed");
      }
      setItem(data.result ?? null);
      setCorpusSize(data.corpusSize ?? 0);
      setTotalCorpusSize(data.totalCorpusSize ?? 0);
      setLastRun(data.generatedAt ?? new Date().toISOString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, [sourceFilter, selectedQuestion]);

  useEffect(() => {
    runAnalysis();
  }, [runAnalysis, analysisKey]);

  if (loading && !item) {
    return (
      <div className="card border-l-4 border-l-[var(--accent)]">
        <p className="text-sm text-[var(--muted)]">
          Running AI analysis on <strong className="text-[var(--accent-soft)]">{sourceLabel}</strong>…
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]">Scanning corpus, matching themes, fetching evidence quotes</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-800 bg-red-900/20 p-4 text-red-300">
        <p className="font-medium">AI analysis could not run</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  if (!item) {
    return (
      <p className="text-[var(--muted)]">
        No data for {selectedQuestion} in {sourceLabel}.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card border-l-4 border-l-[var(--accent)]">
        <p className="text-sm text-[var(--muted)]">
          AI analysis complete —{" "}
          <strong className="text-[var(--accent-soft)]">{item.evidenceCount.toLocaleString()}</strong>{" "}
          matching records from{" "}
          <strong className="text-[var(--accent-soft)]">{corpusSize.toLocaleString()}</strong>{" "}
          reviews in <strong className="text-[var(--accent-soft)]">{sourceLabel}</strong>
          {totalCorpusSize > 0 && corpusSize !== totalCorpusSize && (
            <> (filtered from {totalCorpusSize.toLocaleString()} total)</>
          )}
        </p>
        {lastRun && (
          <p className="mt-1 text-xs text-[var(--muted)]">
            Last run: {new Date(lastRun).toLocaleString()}
          </p>
        )}
      </div>

      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="font-mono text-xs text-[var(--accent-soft)]">{item.id}</span>
            <h3 className="mt-1 text-lg font-semibold leading-snug">{item.question}</h3>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className={`badge ${CONFIDENCE_CLASS[item.confidence]}`}>
              {item.confidence} confidence
            </span>
            <span className="text-xs text-[var(--muted)]">
              {item.evidenceCount} matching docs
            </span>
          </div>
        </div>

        <div className="mt-5 space-y-4 border-t border-[var(--border)] pt-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              AI synthesis
            </p>
            <p className="mt-1 leading-relaxed text-slate-200">{item.answer}</p>
            <p className="mt-2 text-sm italic text-[var(--accent-soft)]">{item.insight}</p>
          </div>

          {item.topThemes.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Top themes
              </p>
              <div className="flex flex-wrap gap-2">
                {item.topThemes.map((t) => (
                  <span
                    key={t.label}
                    className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300"
                  >
                    {t.label}{" "}
                    <span className="text-[var(--accent-soft)]">({t.count})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {sourceFilter === "all" && item.sourceBreakdown.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Evidence by source
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {item.sourceBreakdown.map((s) => (
                  <div
                    key={s.source}
                    className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                  >
                    <p className="text-xs text-[var(--accent-soft)]">
                      {formatSourceLabel(s.source)}
                    </p>
                    <p className="text-lg font-semibold">{s.count}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {item.sampleQuotes.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Sample evidence quotes ({item.sampleQuotes.length} shown)
              </p>
              <div className="space-y-2">
                {item.sampleQuotes.map((q, i) => (
                  <blockquote
                    key={i}
                    className="rounded-lg border-l-2 border-[var(--accent)] bg-[var(--bg)] px-3 py-2"
                  >
                    <span className="text-xs text-[var(--accent-soft)]">
                      [{formatSourceLabel(q.source_type)}]
                    </span>
                    <p className="mt-1 text-sm italic text-slate-300">&quot;{q.excerpt}&quot;</p>
                  </blockquote>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
