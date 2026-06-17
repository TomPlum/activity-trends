"use client";

import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";

/** Tiny axis-less trend used inside stat cards. */
export function Sparkline({
  data,
  dataKey,
  color = "var(--chart-1)",
  height = 40,
}: {
  data: Array<Record<string, number | null | string>>;
  dataKey: string;
  color?: string;
  height?: number;
}) {
  const id = `spark-${dataKey}`;
  const points = data.filter((d) => d[dataKey] != null);
  if (points.length < 2) return <div style={{ height }} />;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={points} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis hide domain={["dataMin", "dataMax"]} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#${id})`}
          isAnimationActive={false}
          dot={false}
          connectNulls
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
