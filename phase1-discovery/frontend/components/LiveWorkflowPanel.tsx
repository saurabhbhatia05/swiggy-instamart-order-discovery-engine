"use client";

import { useEffect, useState } from "react";
import { formatSourceLabel } from "@/lib/sources";
import { RESEARCH_QUESTION_OPTIONS } from "@/lib/researchQuestions";
import { ResearchQuestionsPanel } from "@/components/ResearchQuestionsPanel";

interface LiveWorkflowPanelProps {
  selectedSource: string;
  selectedQuestion: string;
  analysisKey: number;
  onRunAnalysis: () => void;
}

const WORKFLOW_STEPS = [
  { id: "ingest", label: "Ingest" },
  { id: "process", label: "Process & Dedupe" },
  { id: "analyze", label: "AI Analysis" },
  { id: "discover", label: "Discovery Q1–Q8" },
];

function questionLabelFor(id: string): string {
  if (id === "all") return "All questions (Q1–Q8)";
  return RESEARCH_QUESTION_OPTIONS.find((q) => q.value === id)?.label ?? id;
}

export function LiveWorkflowPanel({
  selectedSource,
  selectedQuestion,
  analysisKey,
  onRunAnalysis,
}: LiveWorkflowPanelProps) {
  const [analysisStatus, setAnalysisStatus] = useState<"idle" | "running" | "complete" | "error">("idle");

  useEffect(() => {
    if (analysisKey === 0) {
      setAnalysisStatus("idle");
    }
  }, [analysisKey, selectedSource, selectedQuestion]);

  const sourceLabel =
    selectedSource === "all" ? "all sources" : formatSourceLabel(selectedSource);
  const questionLabel = questionLabelFor(selectedQuestion);

  const stepStatus = (stepId: string): "complete" | "active" | "pending" => {
    if (analysisStatus === "idle") {
      if (stepId === "ingest" || stepId === "process") return "complete";
      return "pending";
    }
    if (analysisStatus === "running") {
      if (stepId === "ingest" || stepId === "process") return "complete";
      if (stepId === "analyze") return "active";
      return "pending";
    }
    if (analysisStatus === "complete" || analysisStatus === "error") {
      return "complete";
    }
    return "pending";
  };

  const handleRun = () => {
    setAnalysisStatus("running");
    onRunAnalysis();
  };

  return (
    <div>
      <div className="card mb-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Live workflow status
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {WORKFLOW_STEPS.map((step, i) => {
            const status = stepStatus(step.id);
            return (
              <div key={step.id} className="flex items-center gap-2">
                <span
                  className={`workflow-step ${
                    status === "active"
                      ? "workflow-step-active"
                      : status === "complete"
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
            );
          })}
        </div>
      </div>

      <div className="card mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm text-[var(--muted)]">
          <p>
            Selected: <strong className="text-[var(--accent-soft)]">{questionLabel}</strong>
          </p>
          <p className="mt-1">
            Data source: <strong className="text-[var(--accent-soft)]">{sourceLabel}</strong>
          </p>
          {analysisKey === 0 && (
            <p className="mt-2 text-xs italic">
              Choose filters above, then click Run AI Analysis to fetch matching records.
            </p>
          )}
        </div>
        <button
          type="button"
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleRun}
          disabled={analysisStatus === "running"}
        >
          {analysisStatus === "running" ? "Running analysis…" : "Run AI Analysis"}
        </button>
      </div>

      <ResearchQuestionsPanel
        sourceFilter={selectedSource}
        selectedQuestion={selectedQuestion}
        analysisKey={analysisKey}
        onStatusChange={setAnalysisStatus}
      />
    </div>
  );
}
