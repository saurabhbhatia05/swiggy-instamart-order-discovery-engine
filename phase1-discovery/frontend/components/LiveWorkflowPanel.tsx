"use client";

import { formatSourceLabel } from "@/lib/sources";
import { RESEARCH_QUESTION_OPTIONS } from "@/components/FilterSelect";
import { ResearchQuestionsPanel } from "@/components/ResearchQuestionsPanel";

interface LiveWorkflowPanelProps {
  selectedSource: string;
  selectedQuestion: string;
}

const WORKFLOW_STEPS = [
  { id: "ingest", label: "Ingest", status: "complete" },
  { id: "process", label: "Process & Dedupe", status: "complete" },
  { id: "analyze", label: "AI Analysis", status: "complete" },
  { id: "discover", label: "Discovery Q1–Q8", status: "active" },
];

export function LiveWorkflowPanel({
  selectedSource,
  selectedQuestion,
}: LiveWorkflowPanelProps) {
  const sourceLabel =
    selectedSource === "all" ? "all sources" : formatSourceLabel(selectedSource);
  const questionLabel =
    RESEARCH_QUESTION_OPTIONS.find((q) => q.value === selectedQuestion)?.label ??
    selectedQuestion;

  return (
    <div>
      <div className="card mb-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Live workflow status
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {WORKFLOW_STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2">
              <span
                className={`workflow-step ${
                  step.status === "active"
                    ? "workflow-step-active"
                    : step.status === "complete"
                      ? "workflow-step-complete"
                      : ""
                }`}
              >
                {step.label}
              </span>
              {i < WORKFLOW_STEPS.length - 1 && (
                <span className="text-[var(--muted)]">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
        Showing <strong className="text-[var(--accent-soft)]">{questionLabel}</strong> from{" "}
        <strong className="text-[var(--accent-soft)]">{sourceLabel}</strong>
      </div>

      <ResearchQuestionsPanel
        sourceFilter={selectedSource}
        selectedQuestion={selectedQuestion}
      />
    </div>
  );
}
