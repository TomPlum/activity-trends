"use client";

import { useState } from "react";
import { Flame, Footprints, Mountain, Route } from "lucide-react";
import { useDailyMetrics } from "@/lib/queries/metrics";
import { PageHeader } from "@/components/dashboard/page-header";
import { RangeSelect } from "@/components/dashboard/range-select";
import { StatCard } from "@/components/dashboard/stat-card";
import { StyleableTrendChart } from "@/components/charts/styleable-trend-chart";
import { CardGridSkeleton, ChartSkeleton, QueryView } from "@/components/dashboard/states";
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

            <StyleableTrendChart
              title="Daily steps"
              data={m}
              defaultType="bar"
              series={[{ key: "steps", label: "Steps", color: "var(--chart-1)" }]}
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <StyleableTrendChart
                title="Active energy"
                data={m}
                height={260}
                series={[{ key: "active_energy", label: "Active energy", color: "var(--chart-3)", unit: "kcal" }]}
              />
              <StyleableTrendChart
                title="Distance"
                data={m}
                height={260}
                series={[{ key: "distance_km", label: "Distance", color: "var(--chart-2)", unit: "km" }]}
              />
            </div>
          </div>
        )}
      </QueryView>
    </>
  );
}
