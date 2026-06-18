"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export interface SeriesDef {
  key: string;
  label: string;
  /** CSS colour, defaults to a chart token. */
  color?: string;
  type?: "area" | "line" | "bar";
  /** Stack id for stacked areas/bars. */
  stackId?: string;
  unit?: string;
}

export function TrendChart({
  data,
  series,
  xKey = "date",
  height = 320,
  yWidth = 44,
  valueFormatter,
  yUnit,
}: {
  data: Array<Record<string, number | null | string>>;
  series: SeriesDef[];
  xKey?: string;
  height?: number;
  yWidth?: number;
  valueFormatter?: (value: number) => string;
  /** Unit appended to Y-axis ticks. Defaults to the sole series' unit. */
  yUnit?: string;
}) {
  const config: ChartConfig = Object.fromEntries(
    series.map((s, i) => [
      s.key,
      { label: s.label, color: s.color ?? `var(--chart-${(i % 5) + 1})` },
    ]),
  );

  // Only show a unit when it's unambiguous — a single series, or an explicit prop.
  const axisUnit = yUnit ?? (series.length === 1 ? series[0].unit : undefined);
  const formatTick = (v: number | string) => {
    const base = valueFormatter
      ? valueFormatter(Number(v))
      : new Intl.NumberFormat("en-GB", { notation: "compact" }).format(Number(v));
    if (!axisUnit || base.endsWith(axisUnit)) return base;
    return `${base}${axisUnit === "%" ? "" : " "}${axisUnit}`;
  };

  return (
    <ChartContainer config={config} style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={`var(--color-${s.key})`} stopOpacity={0.35} />
                <stop offset="95%" stopColor={`var(--color-${s.key})`} stopOpacity={0.04} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.4} />
          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tickFormatter={(v) => {
              try {
                return format(parseISO(String(v)), "d MMM");
              } catch {
                return String(v);
              }
            }}
          />
          <YAxis
            width={yWidth}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatTick}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(label) => {
                  try {
                    return format(parseISO(String(label)), "EEE d MMM yyyy");
                  } catch {
                    return String(label);
                  }
                }}
              />
            }
          />
          {series.map((s) => {
            if (s.type === "bar") {
              return (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  fill={`var(--color-${s.key})`}
                  radius={[4, 4, 0, 0]}
                  stackId={s.stackId}
                  maxBarSize={28}
                />
              );
            }
            if (s.type === "line") {
              return (
                <Line
                  key={s.key}
                  dataKey={s.key}
                  stroke={`var(--color-${s.key})`}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              );
            }
            return (
              <Area
                key={s.key}
                dataKey={s.key}
                type="monotone"
                stroke={`var(--color-${s.key})`}
                strokeWidth={2}
                fill={`url(#fill-${s.key})`}
                stackId={s.stackId}
                connectNulls
              />
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
