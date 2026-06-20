"use client";

import { useState } from "react";
import { Percent, Ruler, Scale } from "lucide-react";
import { useDailyMetrics } from "@/lib/queries/metrics";
import { PageHeader } from "@/components/dashboard/page-header";
import { RangeSelect } from "@/components/dashboard/range-select";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { CardGridSkeleton, ChartSkeleton, QueryView } from "@/components/dashboard/states";
import { ChartHeader } from "@/components/dashboard/chart-header";
import { Card, CardContent } from "@/components/ui/card";
import type { RangeKey } from "@/lib/queries/ranges";
import * as fmt from "@/lib/format";
import { latest, deltaPct } from "@/lib/stats";

/** Compact in-card placeholder for a metric Apple Health didn't record. */
function NoReadings({ metric }: { metric: string }) {
  return (
    <div className="flex h-[240px] flex-col items-center justify-center gap-1 text-center">
      <p className="text-sm font-medium text-muted-foreground">No {metric} readings</p>
      <p className="max-w-xs text-xs text-muted-foreground">
        Your Apple Health export contains no {metric} data — these come from a smart scale or
        manual entry.
      </p>
    </div>
  );
}

export default function BodyPage() {
  const [range, setRange] = useState<RangeKey>("1y");
  const query = useDailyMetrics(range);

  return (
    <>
      <PageHeader
        title="Body"
        description="Weight, BMI and body composition over time."
        actions={<RangeSelect value={range} onChange={setRange} />}
      />

      <QueryView
        query={query}
        loading={
          <div className="space-y-6">
            <CardGridSkeleton count={3} />
            <ChartSkeleton />
          </div>
        }
        isEmpty={(d) => d.every((r) => r.weight_kg == null && r.bmi == null && r.body_fat_pct == null)}
      >
        {(m) => {
          const hasBmi = m.some((d) => d.bmi != null);
          const hasBodyFat = m.some((d) => d.body_fat_pct != null);
          return (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Weight" value={fmt.number(latest(m.map((d) => d.weight_kg)), 1)} unit="kg" icon={Scale} accent="text-chart-5" delta={deltaPct(m.map((d) => d.weight_kg), 30)} invertDelta spark={{ data: m, dataKey: "weight_kg", color: "var(--chart-5)" }} />
              <StatCard label="BMI" value={fmt.number(latest(m.map((d) => d.bmi)), 1)} icon={Ruler} accent="text-chart-3" spark={{ data: m, dataKey: "bmi", color: "var(--chart-3)" }} />
              <StatCard label="Body fat" value={fmt.number(latest(m.map((d) => d.body_fat_pct)), 1)} unit="%" icon={Percent} accent="text-chart-4" spark={{ data: m, dataKey: "body_fat_pct", color: "var(--chart-4)" }} />
            </div>

            <Card>
              <ChartHeader
                title="Weight"
                info="Body weight over time, in kilograms, from each logged measurement. The range defaults to a year so the trend is easy to see."
              />
              <CardContent>
                <TrendChart data={m} series={[{ key: "weight_kg", label: "Weight", color: "var(--chart-5)", unit: "kg" }]} valueFormatter={(v) => v.toFixed(0)} />
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <ChartHeader
                  title="BMI"
                  info="Body Mass Index — weight relative to height. Apple records it directly when available; otherwise it's derived from your weight and height."
                />
                <CardContent>
                  {hasBmi ? (
                    <TrendChart data={m} height={240} series={[{ key: "bmi", label: "BMI", type: "line", color: "var(--chart-3)" }]} valueFormatter={(v) => v.toFixed(0)} />
                  ) : (
                    <NoReadings metric="BMI" />
                  )}
                </CardContent>
              </Card>
              <Card>
                <ChartHeader
                  title="Body fat"
                  info="Body fat percentage over time. These readings come from a smart scale or manual entry — Apple Watch doesn't measure body composition."
                />
                <CardContent>
                  {hasBodyFat ? (
                    <TrendChart data={m} height={240} series={[{ key: "body_fat_pct", label: "Body fat", type: "line", color: "var(--chart-4)", unit: "%" }]} valueFormatter={(v) => `${v.toFixed(0)}%`} />
                  ) : (
                    <NoReadings metric="body fat" />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          );
        }}
      </QueryView>
    </>
  );
}
