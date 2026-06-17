"use client";

import { useState } from "react";
import { Percent, Ruler, Scale } from "lucide-react";
import { useDailyMetrics } from "@/lib/queries/metrics";
import { PageHeader } from "@/components/dashboard/page-header";
import { RangeSelect } from "@/components/dashboard/range-select";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { CardGridSkeleton, ChartSkeleton, QueryView } from "@/components/dashboard/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RangeKey } from "@/lib/queries/ranges";
import * as fmt from "@/lib/format";
import { latest, deltaPct } from "@/lib/stats";

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
        {(m) => (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Weight" value={fmt.number(latest(m.map((d) => d.weight_kg)), 1)} unit="kg" icon={Scale} accent="text-chart-5" delta={deltaPct(m.map((d) => d.weight_kg), 30)} invertDelta spark={{ data: m, dataKey: "weight_kg", color: "var(--chart-5)" }} />
              <StatCard label="BMI" value={fmt.number(latest(m.map((d) => d.bmi)), 1)} icon={Ruler} accent="text-chart-3" spark={{ data: m, dataKey: "bmi", color: "var(--chart-3)" }} />
              <StatCard label="Body fat" value={fmt.number(latest(m.map((d) => d.body_fat_pct)), 1)} unit="%" icon={Percent} accent="text-chart-4" spark={{ data: m, dataKey: "body_fat_pct", color: "var(--chart-4)" }} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Weight</CardTitle>
              </CardHeader>
              <CardContent>
                <TrendChart data={m} series={[{ key: "weight_kg", label: "Weight", color: "var(--chart-5)", unit: "kg" }]} valueFormatter={(v) => v.toFixed(0)} />
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">BMI</CardTitle>
                </CardHeader>
                <CardContent>
                  <TrendChart data={m} height={240} series={[{ key: "bmi", label: "BMI", type: "line", color: "var(--chart-3)" }]} valueFormatter={(v) => v.toFixed(0)} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Body fat</CardTitle>
                </CardHeader>
                <CardContent>
                  <TrendChart data={m} height={240} series={[{ key: "body_fat_pct", label: "Body fat", type: "line", color: "var(--chart-4)", unit: "%" }]} valueFormatter={(v) => `${v.toFixed(0)}%`} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </QueryView>
    </>
  );
}
