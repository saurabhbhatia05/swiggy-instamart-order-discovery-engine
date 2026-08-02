"use client";

import { formatSourceLabel } from "@/lib/sources";
import { RESEARCH_QUESTION_OPTIONS } from "@/lib/researchQuestions";

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  id?: string;
  fullWidth?: boolean;
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  id,
  fullWidth = false,
}: FilterSelectProps) {
  const selectId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${fullWidth ? "w-full" : "flex-1 sm:max-w-md"}`}>
      <label
        htmlFor={selectId}
        className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]"
      >
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select-input"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface SourceSelectProps {
  selectedSource: string;
  onSourceChange: (source: string) => void;
  sourceDistribution: { source: string; count: number }[];
  totalDocuments: number;
  fullWidth?: boolean;
}

export function SourceSelect({
  selectedSource,
  onSourceChange,
  sourceDistribution,
  totalDocuments,
  fullWidth,
}: SourceSelectProps) {
  const options = [
    { value: "all", label: `All sources (${totalDocuments.toLocaleString()})` },
    ...sourceDistribution.map((item) => ({
      value: item.source,
      label: `${formatSourceLabel(item.source)} (${item.count.toLocaleString()})`,
    })),
  ];

  return (
    <FilterSelect
      label="Filter by data source"
      value={selectedSource}
      onChange={onSourceChange}
      options={options}
      id="data-source-filter"
      fullWidth={fullWidth}
    />
  );
}

interface QuestionSelectProps {
  selectedQuestion: string;
  onQuestionChange: (questionId: string) => void;
  fullWidth?: boolean;
}

export function QuestionSelect({
  selectedQuestion,
  onQuestionChange,
  fullWidth,
}: QuestionSelectProps) {
  return (
    <FilterSelect
      label="Research question"
      value={selectedQuestion}
      onChange={onQuestionChange}
      options={RESEARCH_QUESTION_OPTIONS}
      id="research-question-filter"
      fullWidth={fullWidth}
    />
  );
}
