"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, ChevronRight, Droplets, Gauge, HeartPulse, Wind } from "lucide-react";
import { useDailyMetrics } from "@/lib/queries/metrics";
import { useEcgList } from "@/lib/queries/ecg";
import { PageHeader } from "@/components/dashboard/page-header";
import { RangeSelect } from "@/components/dashboard/range-select";
import { StatCard } from "@/components/dashboard/stat-card";
import { ReadinessCard } from "@/components/dashboard/readiness-card";
import { computeReadiness } from "@/lib/health/readiness";
import { StyleableTrendChart } from "@/components/charts/styleable-trend-chart";
import { CardGridSkeleton, ChartSkeleton, QueryView } from "@/components/dashboard/states";
import { ChartHeader } from "@/components/dashboard/chart-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
        {(m) => {
          const readiness = computeReadiness(m);
          return (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Resting HR" value={fmt.number(latest(m.map((d) => d.resting_hr)))} unit="bpm" icon={HeartPulse} accent="text-chart-4" delta={deltaPct(m.map((d) => d.resting_hr), 7)} invertDelta spark={{ data: m, dataKey: "resting_hr", color: "var(--chart-4)" }} />
              <StatCard label="HRV (SDNN)" value={fmt.number(latest(m.map((d) => d.hrv_ms)))} unit="ms" icon={Activity} accent="text-chart-1" delta={deltaPct(m.map((d) => d.hrv_ms), 7)} spark={{ data: m, dataKey: "hrv_ms", color: "var(--chart-1)" }} />
              <StatCard label="VO₂ Max" value={fmt.number(latest(m.map((d) => d.vo2max)), 1)} unit="ml/kg·min" icon={Gauge} accent="text-chart-3" spark={{ data: m, dataKey: "vo2max", color: "var(--chart-3)" }} />
              <StatCard label="Blood oxygen" value={fmt.number(mean(m.map((d) => d.blood_oxygen)), 1)} unit="%" icon={Droplets} accent="text-chart-2" spark={{ data: m, dataKey: "blood_oxygen", color: "var(--chart-2)" }} />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <ChartHeader
                  icon={Gauge}
                  iconClass="text-chart-1"
                  title="Readiness"
                  info="A 0–100 daily score blending HRV, resting heart rate, sleep and the previous day's exercise load against your own recent baseline. Higher means better recovered and readier to train."
                />
                <CardContent>
                  <ReadinessCard days={readiness} />
                </CardContent>
              </Card>
              <StyleableTrendChart
                className="lg:col-span-2"
                title="Resting heart rate & HRV"
                data={m}
                defaultType="line"
                series={[
                  { key: "resting_hr", label: "Resting HR", color: "var(--chart-4)", unit: "bpm" },
                  { key: "hrv_ms", label: "HRV", color: "var(--chart-1)", unit: "ms" },
                ]}
                info="Resting heart rate (beats per minute, lower is generally fitter) and heart rate variability (SDNN in milliseconds, higher generally signals better recovery), tracked together over time."
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <StyleableTrendChart
                title="VO₂ Max"
                data={m}
                height={260}
                series={[{ key: "vo2max", label: "VO₂ Max", color: "var(--chart-3)" }]}
                valueFormatter={(v) => v.toFixed(0)}
                info="Estimated maximum oxygen uptake (ml/kg/min) — Apple's measure of cardio fitness. It moves slowly; a rising trend means your aerobic fitness is improving."
              />
              <StyleableTrendChart
                title={
                  <>
                    <Wind className="h-4 w-4 text-chart-2" /> Respiratory rate
                  </>
                }
                data={m}
                height={260}
                defaultType="line"
                series={[{ key: "respiratory_rate", label: "Respiratory rate", color: "var(--chart-2)", unit: "br/min" }]}
                valueFormatter={(v) => v.toFixed(0)}
                info="Breaths per minute, mostly measured during sleep. A stable resting rate is normal; a sustained jump can accompany illness, stress or poor recovery."
              />
            </div>
          </div>
          );
        }}
      </QueryView>

      <EcgSection />
    </>
  );
}

function EcgSection() {
  const { data, isPending } = useEcgList();
  if (!isPending && (!data || data.length === 0)) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <HeartPulse className="h-4 w-4 text-chart-4" /> ECG recordings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isPending
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)
          : data!.map((e) => (
              <Link
                key={e.id}
                href={`/ecg/${e.id}`}
                className="flex items-center justify-between rounded-lg border px-3 py-2 transition-colors hover:bg-accent/50"
              >
                <div>
                  <p className="text-sm font-medium">{fmt.shortDate(e.recorded_at)}</p>
                  <p className="text-xs text-muted-foreground">{fmt.timeOfDay(e.recorded_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  {e.classification && <Badge variant="secondary">{e.classification}</Badge>}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
      </CardContent>
    </Card>
  );
}
