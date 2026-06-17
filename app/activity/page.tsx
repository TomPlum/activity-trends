"use client";

import { useState } from "react";
import { Flame, Footprints, Mountain, Route } from "lucide-react";
import { useDailyMetrics } from "@/lib/queries/metrics";
import { PageHeader } from "@/components/dashboard/page-header";
import { RangeSelect } from "@/components/dashboard/range-select";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { CardGridSkeleton, ChartSkeleton, QueryView } from "@/components/dashboard/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RangeKey } from "@/lib/queries/ranges";
import * as fmt from "@/lib/format";
import { mean, sum, deltaPct } from "@/lib/stats";

export default function ActivityPage() {
  const [range, setRange] = useState<RangeKey>("90d");
  const query = useDailyMetrics(range);

  return (
    <>
      <PageHeader
        title="Activity & Movement"
        description="Steps, distance, flights climbed and the energy you burn each day."
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
              <StatCard label="Avg daily steps" value={fmt.number(mean(m.map((d) => d.steps)))} icon={Footprints} accent="text-chart-1" delta={deltaPct(m.map((d) => d.steps), 7)} />
              <StatCard label="Total distance" value={fmt.number(sum(m.map((d) => d.distance_km)))} unit="km" icon={Route} accent="text-chart-2" />
              <StatCard label="Avg active energy" value={fmt.number(mean(m.map((d) => d.active_energy)))} unit="kcal" icon={Flame} accent="text-chart-3" delta={deltaPct(m.map((d) => d.active_energy), 7)} />
              <StatCard label="Flights climbed" value={fmt.number(sum(m.map((d) => d.flights_climbed)))} icon={Mountain} accent="text-chart-5" />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Daily steps</CardTitle>
              </CardHeader>
              <CardContent>
                <TrendChart data={m} series={[{ key: "steps", label: "Steps", type: "bar", color: "var(--chart-1)" }]} />
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Active energy</CardTitle>
                </CardHeader>
                <CardContent>
                  <TrendChart data={m} height={260} series={[{ key: "active_energy", label: "Active energy", color: "var(--chart-3)", unit: "kcal" }]} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Distance</CardTitle>
                </CardHeader>
                <CardContent>
                  <TrendChart data={m} height={260} series={[{ key: "distance_km", label: "Distance", color: "var(--chart-2)", unit: "km" }]} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </QueryView>
    </>
  );
}
