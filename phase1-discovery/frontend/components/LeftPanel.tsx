"use client";

import { formatSourceLabel } from "@/lib/sources";
import { QuestionSelect, SourceSelect } from "@/components/FilterSelect";

interface SourceItem {
  source: string;
  count: number;
}

interface LeftPanelProps {
  totalDocuments: number;
  sourceDistribution: SourceItem[];
  selectedSource: string;
  onSourceChange: (source: string) => void;
  selectedQuestion: string;
  onQuestionChange: (questionId: string) => void;
  showQuestionFilter: boolean;
}

export function LeftPanel({
  totalDocuments,
  sourceDistribution,
  selectedSource,
  onSourceChange,
  selectedQuestion,
  onQuestionChange,
  showQuestionFilter,
}: LeftPanelProps) {
  const maxCount = Math.max(...sourceDistribution.map((s) => s.count), 1);

  return (
    <aside className="flex h-full min-w-0 flex-col overflow-hidden border-r border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
          Corpus Overview
        </p>
        <p className="mt-3 text-xs text-[var(--muted)]">Total reviews in corpus</p>
        <p className="metric-value mt-1">{totalDocuments.toLocaleString()}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
          Corpus by source
        </p>
        <ul className="mb-6 space-y-1">
          <li>
            <button
              type="button"
              onClick={() => onSourceChange("all")}
              className={`source-item w-full ${selectedSource === "all" ? "source-item-active" : ""}`}
            >
              <span className="text-sm">All sources</span>
              <span className="font-mono text-xs text-[var(--accent-soft)]">
                {totalDocuments.toLocaleString()}
              </span>
            </button>
          </li>
          {sourceDistribution.map((item) => {
            const pct = Math.round((item.count / maxCount) * 100);
            return (
              <li key={item.source}>
                <button
                  type="button"
                  onClick={() => onSourceChange(item.source)}
                  className={`source-item w-full ${selectedSource === item.source ? "source-item-active" : ""}`}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="truncate text-sm">{formatSourceLabel(item.source)}</span>
                    <span className="shrink-0 font-mono text-xs text-[var(--accent-soft)]">
                      {item.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-[var(--bg)]">
                    <div
                      className="h-full rounded-full bg-[var(--accent)] transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="space-y-4 border-t border-[var(--border)] pt-4">
          <SourceSelect
            selectedSource={selectedSource}
            onSourceChange={onSourceChange}
            sourceDistribution={sourceDistribution}
            totalDocuments={totalDocuments}
            fullWidth
          />
          {showQuestionFilter && (
            <QuestionSelect
              selectedQuestion={selectedQuestion}
              onQuestionChange={onQuestionChange}
              fullWidth
            />
          )}
        </div>
      </div>
    </aside>
  );
}
