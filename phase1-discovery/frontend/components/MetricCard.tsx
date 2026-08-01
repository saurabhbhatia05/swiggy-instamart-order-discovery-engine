interface MetricCardProps {
  label: string;
  value: number | string;
  hint?: string;
}

export function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <div className="card">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="metric-value mt-1">{value.toLocaleString()}</p>
      {hint && <p className="mt-2 text-xs text-[var(--muted)]">{hint}</p>}
    </div>
  );
}
