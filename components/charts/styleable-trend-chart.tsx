"use client";

import { useState, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoHint } from "@/components/dashboard/info-hint";
import { TrendChart, type SeriesDef } from "./trend-chart";
import { ChartTypeToggle, type ChartType } from "./chart-type-toggle";

/**
 * A chart card with a built-in bar/line/area style toggle. Unlike
 * {@link ConfigurableTrendChart} it keeps a fixed set of series (so multi-series
 * comparison charts stay intact) and just lets the viewer switch how every
 * series is drawn. `defaultType` should match the chart's original appearance
 * so the first render is unchanged.
 */
export function StyleableTrendChart({
  title,
  subtitle,
  series,
  data,
  defaultType = "area",
  height,
  xKey,
  valueFormatter,
  yUnit,
  yWidth,
  footer,
  info,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  series: SeriesDef[];
  data: Array<Record<string, number | null | string>>;
  defaultType?: ChartType;
  height?: number;
  xKey?: string;
  valueFormatter?: (value: number) => string;
  yUnit?: string;
  yWidth?: number;
  /** Extra content rendered beneath the chart (e.g. a caption). */
  footer?: ReactNode;
  /** Tooltip text explaining what the chart shows, shown via an info icon. */
  info?: string;
  /** Applied to the wrapping Card (e.g. column spans). */
  className?: string;
}) {
  const [type, setType] = useState<ChartType>(defaultType);
  const typedSeries = series.map((s) => ({ ...s, type }));

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
          <ChartTypeToggle value={type} onChange={setType} />
          {info && <InfoHint text={info} />}
        </div>
      </CardHeader>
      <CardContent>
        <TrendChart
          data={data}
          series={typedSeries}
          height={height}
          xKey={xKey}
          valueFormatter={valueFormatter}
          yUnit={yUnit}
          yWidth={yWidth}
        />
        {footer}
      </CardContent>
    </Card>
  );
}
