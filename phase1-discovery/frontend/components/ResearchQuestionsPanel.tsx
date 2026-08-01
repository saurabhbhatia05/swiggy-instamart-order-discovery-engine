"use client";

import { useEffect, useState } from "react";
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
}

export function ResearchQuestionsPanel({
  sourceFilter = "all",
  selectedQuestion = "Q1",
}: ResearchQuestionsPanelProps) {
  const [answers, setAnswers] = useState<ResearchAnswer[]>([]);
  const [corpusSize, setCorpusSize] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = sourceFilter !== "all" ? `?source=${encodeURIComponent(sourceFilter)}` : "";
    fetch(`/api/research-questions${params}`)
      .then((r) => r.json())
      .then((data) => {
        setAnswers(data.questions ?? []);
        setCorpusSize(data.corpusSize ?? 0);
      })
      .finally(() => setLoading(false));
  }, [sourceFilter]);

  const sourceLabel =
    sourceFilter === "all" ? "all sources" : formatSourceLabel(sourceFilter);

  const item = answers.find((a) => a.id === selectedQuestion);

  if (loading) {
    return (
      <p className="text-[var(--muted)]">
        Analyzing {sourceLabel}...
      </p>
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
          Answer synthesized from{" "}
          <strong className="text-[var(--accent-soft)]">{corpusSize.toLocaleString()}</strong>{" "}
          reviews in <strong className="text-[var(--accent-soft)]">{sourceLabel}</strong>.
        </p>
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
                Sample evidence quotes
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
