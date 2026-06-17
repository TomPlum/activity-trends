"use client";

import { useState } from "react";
import { Activity, Droplets, Gauge, HeartPulse, Wind } from "lucide-react";
import { useDailyMetrics } from "@/lib/queries/metrics";
import { PageHeader } from "@/components/dashboard/page-header";
import { RangeSelect } from "@/components/dashboard/range-select";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { CardGridSkeleton, ChartSkeleton, QueryView } from "@/components/dashboard/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RangeKey } from "@/lib/queries/ranges";
import * as fmt from "@/lib/format";
import { mean, latest, deltaPct } from "@/lib/stats";

export default function HeartPage() {
  const [range, setRange] = useState<RangeKey>("90d");
  const query = useDailyMetrics(range);

  return (
    <>
      <PageHeader
        title="Heart & Vitals"
        description="Resting heart rate, variability, cardio fitness and respiratory trends."
        actions={<RangeSelect value={range} onChange={setRange} />}
      />

      <QueryView
        query={query}
        loading={
          <div className="space-y-6">
            <CardGridSkeleton />
            <ChartSkeleton />
          </div>
        }
        isEmpty={(d) => d.length === 0}
      >
        {(m) => (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Resting HR" value={fmt.number(latest(m.map((d) => d.resting_hr)))} unit="bpm" icon={HeartPulse} accent="text-chart-4" delta={deltaPct(m.map((d) => d.resting_hr), 7)} invertDelta spark={{ data: m, dataKey: "resting_hr", color: "var(--chart-4)" }} />
              <StatCard label="HRV (SDNN)" value={fmt.number(latest(m.map((d) => d.hrv_ms)))} unit="ms" icon={Activity} accent="text-chart-1" delta={deltaPct(m.map((d) => d.hrv_ms), 7)} spark={{ data: m, dataKey: "hrv_ms", color: "var(--chart-1)" }} />
              <StatCard label="VO₂ Max" value={fmt.number(latest(m.map((d) => d.vo2max)), 1)} unit="ml/kg·min" icon={Gauge} accent="text-chart-3" spark={{ data: m, dataKey: "vo2max", color: "var(--chart-3)" }} />
              <StatCard label="Blood oxygen" value={fmt.number(mean(m.map((d) => d.blood_oxygen)), 1)} unit="%" icon={Droplets} accent="text-chart-2" spark={{ data: m, dataKey: "blood_oxygen", color: "var(--chart-2)" }} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resting heart rate & HRV</CardTitle>
              </CardHeader>
              <CardContent>
                <TrendChart
                  data={m}
                  series={[
                    { key: "resting_hr", label: "Resting HR", type: "line", color: "var(--chart-4)", unit: "bpm" },
                    { key: "hrv_ms", label: "HRV", type: "line", color: "var(--chart-1)", unit: "ms" },
                  ]}
                />
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">VO₂ Max</CardTitle>
                </CardHeader>
                <CardContent>
                  <TrendChart data={m} height={260} series={[{ key: "vo2max", label: "VO₂ Max", color: "var(--chart-3)" }]} valueFormatter={(v) => v.toFixed(0)} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Wind className="h-4 w-4 text-chart-2" /> Respiratory rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TrendChart data={m} height={260} series={[{ key: "respiratory_rate", label: "Respiratory rate", type: "line", color: "var(--chart-2)", unit: "br/min" }]} valueFormatter={(v) => v.toFixed(0)} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </QueryView>
    </>
  );
}
