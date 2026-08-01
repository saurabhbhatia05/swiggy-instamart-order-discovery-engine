"use client";

import { useState } from "react";

interface Hypothesis {
  statement: string;
  research_question: string;
  confidence: string;
  evidence_count: number;
  sample_quotes?: string[];
}

export function InsightsPanel({ hypotheses }: { hypotheses: Hypothesis[] }) {
  const [approved, setApproved] = useState<Record<number, boolean>>({});

  if (!hypotheses.length) {
    return (
      <p className="text-[var(--muted)]">
        No insights found. Run <code className="text-[var(--accent-soft)]">python run_analysis.py</code>.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {hypotheses.map((h, idx) => (
        <div key={idx} className="card">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded bg-orange-900/40 px-2 py-0.5 text-xs font-mono text-orange-300">
              {h.research_question}
            </span>
            <span
              className={`badge badge-${h.confidence === "high" ? "high" : h.confidence === "medium" ? "medium" : "low"}`}
            >
              {h.confidence} confidence
            </span>
            <span className="text-xs text-[var(--muted)]">
              {h.evidence_count} evidence docs
            </span>
            {approved[idx] !== undefined && (
              <span className="text-xs text-emerald-400">
                {approved[idx] ? "Approved" : "Rejected"}
              </span>
            )}
          </div>
          <p className="text-base leading-relaxed">{h.statement}</p>
          {h.sample_quotes && h.sample_quotes.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Sample quotes
              </p>
              {h.sample_quotes.map((q, qi) => (
                <blockquote
                  key={qi}
                  className="border-l-2 border-[var(--accent)] pl-3 text-sm italic text-slate-300"
                >
                  {q}
                </blockquote>
              ))}
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary text-xs"
              onClick={() => setApproved((p) => ({ ...p, [idx]: true }))}
            >
              Approve
            </button>
            <button
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-xs text-[var(--muted)] hover:border-red-500 hover:text-red-300"
              onClick={() => setApproved((p) => ({ ...p, [idx]: false }))}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
