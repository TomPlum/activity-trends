"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendChart } from "./trend-chart";
import { ChartTypeToggle, type ChartType } from "./chart-type-toggle";

export interface ChartMetric {
  key: string;
  label: string;
  icon?: LucideIcon;
  unit?: string;
  /** CSS colour for the series; defaults to a chart token. */
  color?: string;
  data: Array<{ date: string; value: number | null }>;
  valueFormatter?: (value: number) => string;
}

/**
 * A chart card with a built-in metric selector (cycle through stats) and a
 * bar/line/area type toggle. Reusable across pages — pass a list of metrics,
 * each carrying its own pre-aggregated `{ date, value }[]` series.
 */
export function ConfigurableTrendChart({
  metrics,
  title,
  defaultMetric,
  defaultType = "bar",
  height,
}: {
  metrics: ChartMetric[];
  title?: string;
  defaultMetric?: string;
  defaultType?: ChartType;
  height?: number;
}) {
  const [metricKey, setMetricKey] = useState(defaultMetric ?? metrics[0]?.key);
  const [type, setType] = useState<ChartType>(defaultType);

  const metric = metrics.find((m) => m.key === metricKey) ?? metrics[0];
  const Icon = metric?.icon;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
              <Icon className="h-5 w-5" style={{ color: metric?.color }} />
            </span>
          )}
          <div className="space-y-0.5">
            {title && <p className="text-xs text-muted-foreground">{title}</p>}
            <p className="text-base font-semibold leading-none">
              {metric?.label}
              {metric?.unit ? (
                <span className="ml-1 text-sm font-normal text-muted-foreground">{metric.unit}</span>
              ) : null}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={metricKey} onValueChange={setMetricKey}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {metrics.map((m) => (
                <SelectItem key={m.key} value={m.key}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ChartTypeToggle value={type} onChange={setType} />
        </div>
      </CardHeader>
      <CardContent>
        {metric && (
          <TrendChart
            data={metric.data}
            series={[
              {
                key: "value",
                label: metric.label,
                type,
                color: metric.color,
                unit: metric.unit,
              },
            ]}
            height={height}
            valueFormatter={metric.valueFormatter}
          />
        )}
      </CardContent>
    </Card>
  );
}
