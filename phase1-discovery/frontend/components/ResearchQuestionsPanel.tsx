"use client";

import { useCallback, useEffect, useState } from "react";
import { formatSourceLabel } from "@/lib/sources";
import { RESEARCH_QUESTION_OPTIONS } from "@/lib/researchQuestions";

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

const PROGRESS_STEPS = [
  "Loading corpus from server…",
  "Applying source filter…",
  "Matching themes across reviews…",
  "Running AI synthesis…",
  "Fetching evidence quotes…",
];

interface ResearchQuestionsPanelProps {
  sourceFilter?: string;
  selectedQuestion?: string;
  analysisKey?: number;
  onStatusChange?: (status: "idle" | "running" | "complete" | "error") => void;
}

function QuestionResultCard({
  item,
  sourceFilter,
}: {
  item: ResearchAnswer;
  sourceFilter: string;
}) {
  return (
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
  );
}

function AnalysisProgress({
  sourceLabel,
  questionLabel,
  progressStep,
}: {
  sourceLabel: string;
  questionLabel: string;
  progressStep: number;
}) {
  const pct = Math.round(((progressStep + 1) / PROGRESS_STEPS.length) * 100);

  return (
    <div className="card border-l-4 border-l-[var(--accent)]">
      <p className="text-sm font-medium text-[var(--accent-soft)]">Running AI analysis…</p>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {questionLabel} · {sourceLabel}
      </p>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--bg)]">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-[var(--muted)]">{pct}% complete</p>

      <ul className="mt-4 space-y-2">
        {PROGRESS_STEPS.map((step, i) => {
          const done = i < progressStep;
          const active = i === progressStep;
          return (
            <li
              key={step}
              className={`flex items-center gap-2 text-sm ${
                done
                  ? "text-emerald-300"
                  : active
                    ? "text-[var(--accent-soft)]"
                    : "text-[var(--muted)]"
              }`}
            >
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs">
                {done ? "✓" : active ? "…" : i + 1}
              </span>
              {step}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ResearchQuestionsPanel({
  sourceFilter = "all",
  selectedQuestion = "all",
  analysisKey = 0,
  onStatusChange,
}: ResearchQuestionsPanelProps) {
  const [items, setItems] = useState<ResearchAnswer[]>([]);
  const [corpusSize, setCorpusSize] = useState(0);
  const [totalCorpusSize, setTotalCorpusSize] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [progressStep, setProgressStep] = useState(0);

  const sourceLabel =
    sourceFilter === "all" ? "all sources" : formatSourceLabel(sourceFilter);
  const questionLabel =
    selectedQuestion === "all"
      ? "All questions (Q1–Q8)"
      : (RESEARCH_QUESTION_OPTIONS.find((q) => q.value === selectedQuestion)?.label ??
        selectedQuestion);

  const runAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    setItems([]);
    setProgressStep(0);
    onStatusChange?.("running");

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

      const results: ResearchAnswer[] = data.results ?? (data.result ? [data.result] : []);
      setItems(results);
      setCorpusSize(data.corpusSize ?? 0);
      setTotalCorpusSize(data.totalCorpusSize ?? 0);
      setLastRun(data.generatedAt ?? new Date().toISOString());
      setProgressStep(PROGRESS_STEPS.length - 1);
      onStatusChange?.("complete");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
      setItems([]);
      onStatusChange?.("error");
    } finally {
      setLoading(false);
    }
  }, [sourceFilter, selectedQuestion, onStatusChange]);

  useEffect(() => {
    if (analysisKey === 0) return;
    runAnalysis();
  }, [analysisKey, runAnalysis]);

  useEffect(() => {
    if (!loading) return;
    let step = 0;
    setProgressStep(0);
    const interval = setInterval(() => {
      step = Math.min(step + 1, PROGRESS_STEPS.length - 2);
      setProgressStep(step);
    }, 700);
    return () => clearInterval(interval);
  }, [loading]);

  if (analysisKey === 0 && !loading) {
    return (
      <div className="card border border-dashed border-[var(--border)] bg-[var(--bg)]/50">
        <p className="text-sm text-[var(--muted)]">
          No analysis run yet. Select a data source and research question, then click{" "}
          <strong className="text-[var(--accent-soft)]">Run AI Analysis</strong> to fetch
          matching records from the corpus.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <AnalysisProgress
        sourceLabel={sourceLabel}
        questionLabel={questionLabel}
        progressStep={progressStep}
      />
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

  if (items.length === 0) {
    return (
      <p className="text-[var(--muted)]">
        No data for {questionLabel} in {sourceLabel}.
      </p>
    );
  }

  const totalEvidence = items.reduce((sum, i) => sum + i.evidenceCount, 0);

  return (
    <div className="space-y-4">
      <div className="card border-l-4 border-l-[var(--accent)]">
        <p className="text-sm text-[var(--muted)]">
          AI analysis complete —{" "}
          <strong className="text-[var(--accent-soft)]">
            {items.length > 1
              ? `${items.length} questions analyzed`
              : `${items[0].evidenceCount.toLocaleString()} matching records`}
          </strong>
          {items.length === 1 && (
            <>
              {" "}
              from{" "}
              <strong className="text-[var(--accent-soft)]">{corpusSize.toLocaleString()}</strong>{" "}
              reviews in <strong className="text-[var(--accent-soft)]">{sourceLabel}</strong>
            </>
          )}
          {items.length > 1 && (
            <>
              {" "}
              ·{" "}
              <strong className="text-[var(--accent-soft)]">
                {totalEvidence.toLocaleString()}
              </strong>{" "}
              total matching records from{" "}
              <strong className="text-[var(--accent-soft)]">{corpusSize.toLocaleString()}</strong>{" "}
              reviews in <strong className="text-[var(--accent-soft)]">{sourceLabel}</strong>
            </>
          )}
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

      {items.map((item) => (
        <QuestionResultCard key={item.id} item={item} sourceFilter={sourceFilter} />
      ))}
    </div>
  );
}
