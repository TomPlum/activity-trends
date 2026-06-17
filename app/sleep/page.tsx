"use client";

import { useState } from "react";
import { Moon, Gauge, Sparkles, BedDouble } from "lucide-react";
import { useSleepSessions } from "@/lib/queries/sleep";
import { PageHeader } from "@/components/dashboard/page-header";
import { RangeSelect } from "@/components/dashboard/range-select";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { CardGridSkeleton, ChartSkeleton, QueryView } from "@/components/dashboard/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RangeKey } from "@/lib/queries/ranges";
import * as fmt from "@/lib/format";
import { mean } from "@/lib/stats";

export default function SleepPage() {
  const [range, setRange] = useState<RangeKey>("90d");
  const query = useSleepSessions(range);

  return (
    <>
      <PageHeader
        title="Sleep"
        description="Sleep stages, quality and duration across your nights."
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
        {(sessions) => {
          const data = sessions.map((s) => ({
            date: s.start_time.slice(0, 10),
            deep: s.deep_min ?? 0,
            rem: s.rem_min ?? 0,
            light: s.light_min ?? 0,
            awake: s.awake_min ?? 0,
            quality: s.quality_pct ?? null,
            hours: s.duration_min != null ? s.duration_min / 60 : null,
          }));

          return (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Avg time asleep" value={fmt.duration(mean(sessions.map((s) => s.duration_min)))} icon={BedDouble} accent="text-chart-2" />
                <StatCard label="Avg quality" value={fmt.number(mean(sessions.map((s) => s.quality_pct)))} unit="%" icon={Gauge} accent="text-chart-1" />
                <StatCard label="Avg deep sleep" value={fmt.duration(mean(sessions.map((s) => s.deep_min)))} icon={Moon} accent="text-chart-5" />
                <StatCard label="Avg REM" value={fmt.duration(mean(sessions.map((s) => s.rem_min)))} icon={Sparkles} accent="text-chart-3" />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sleep stages</CardTitle>
                </CardHeader>
                <CardContent>
                  <TrendChart
                    data={data}
                    valueFormatter={(v) => `${Math.round(v / 60)}h`}
                    series={[
                      { key: "deep", label: "Deep", color: "var(--chart-5)", stackId: "s" },
                      { key: "rem", label: "REM", color: "var(--chart-3)", stackId: "s" },
                      { key: "light", label: "Light", color: "var(--chart-2)", stackId: "s" },
                      { key: "awake", label: "Awake", color: "var(--chart-4)", stackId: "s" },
                    ]}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sleep quality</CardTitle>
                </CardHeader>
                <CardContent>
                  <TrendChart
                    data={data}
                    height={240}
                    series={[{ key: "quality", label: "Quality", type: "line", color: "var(--chart-1)", unit: "%" }]}
                    valueFormatter={(v) => `${v.toFixed(0)}%`}
                  />
                </CardContent>
              </Card>
            </div>
          );
        }}
      </QueryView>
    </>
  );
}
