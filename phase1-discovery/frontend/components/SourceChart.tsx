"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SourceDistribution {
  source: string;
  count: number;
}

export function SourceChart({ data }: { data: SourceDistribution[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d3a4f" />
          <XAxis
            dataKey="source"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            angle={-35}
            textAnchor="end"
            interval={0}
          />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              background: "#1a2332",
              border: "1px solid #2d3a4f",
              borderRadius: 8,
            }}
            labelStyle={{ color: "#f0f4f8" }}
          />
          <Bar dataKey="count" fill="#fc8019" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
