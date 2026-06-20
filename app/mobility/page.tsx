"use client";

import { useState } from "react";
import { Activity, Footprints, Gauge, PersonStanding, TrendingUpDown } from "lucide-react";
import { useDailyMetrics } from "@/lib/queries/metrics";
import { PageHeader } from "@/components/dashboard/page-header";
import { RangeSelect } from "@/components/dashboard/range-select";
import { StatCard } from "@/components/dashboard/stat-card";
import { StyleableTrendChart } from "@/components/charts/styleable-trend-chart";
import { CardGridSkeleton, ChartSkeleton, QueryView } from "@/components/dashboard/states";
import type { RangeKey } from "@/lib/queries/ranges";
import * as fmt from "@/lib/format";
import { mean, latest } from "@/lib/stats";

export default function MobilityPage() {
  const [range, setRange] = useState<RangeKey>("90d");
  const query = useDailyMetrics(range);

  return (
    <>
      <PageHeader
        title="Mobility & Walking"
        description="Gait quality — walking speed, step length, symmetry and steadiness."
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
        isEmpty={(d) =>
          d.every((r) => r.walking_speed_kmh == null && r.walking_steadiness_pct == null)
        }
      >
        {(m) => (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Walking speed" value={fmt.number(mean(m.map((d) => d.walking_speed_kmh)), 1)} unit="km/h" icon={Gauge} accent="text-chart-1" spark={{ data: m, dataKey: "walking_speed_kmh", color: "var(--chart-1)" }} />
              <StatCard label="Step length" value={fmt.number(mean(m.map((d) => d.step_length_cm)), 1)} unit="cm" icon={Footprints} accent="text-chart-3" spark={{ data: m, dataKey: "step_length_cm", color: "var(--chart-3)" }} />
              <StatCard label="Walking steadiness" value={fmt.number(latest(m.map((d) => d.walking_steadiness_pct)), 1)} unit="%" icon={PersonStanding} accent="text-chart-2" spark={{ data: m, dataKey: "walking_steadiness_pct", color: "var(--chart-2)" }} />
              <StatCard label="Asymmetry" value={fmt.number(mean(m.map((d) => d.walking_asymmetry_pct)), 1)} unit="%" icon={TrendingUpDown} accent="text-chart-4" invertDelta spark={{ data: m, dataKey: "walking_asymmetry_pct", color: "var(--chart-4)" }} />
            </div>

            <StyleableTrendChart
              title="Walking speed & step length"
              data={m}
              defaultType="line"
              series={[
                { key: "walking_speed_kmh", label: "Speed (km/h)", color: "var(--chart-1)" },
                { key: "step_length_cm", label: "Step length (cm)", color: "var(--chart-3)" },
              ]}
              valueFormatter={(v) => v.toFixed(0)}
              info="Your average walking pace (km/h) and how far you travel per step (cm). Both are gauges of gait health — they tend to dip when you're tired, injured or unwell."
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <StyleableTrendChart
                title={
                  <>
                    <Activity className="h-4 w-4 text-chart-4" /> Gait symmetry
                  </>
                }
                data={m}
                height={260}
                defaultType="line"
                series={[
                  { key: "walking_asymmetry_pct", label: "Asymmetry %", color: "var(--chart-4)" },
                  { key: "double_support_pct", label: "Double support %", color: "var(--chart-5)" },
                ]}
                valueFormatter={(v) => `${v.toFixed(0)}%`}
                info="Walking asymmetry is the percentage of time your steps are uneven between legs; double support is the share of each stride with both feet on the ground. Lower is steadier — both rise with fatigue or injury."
              />
              <StyleableTrendChart
                title="Stair speed"
                data={m}
                height={260}
                defaultType="line"
                series={[
                  { key: "stair_ascent_speed", label: "Ascent", color: "var(--chart-1)" },
                  { key: "stair_descent_speed", label: "Descent", color: "var(--chart-2)" },
                ]}
                valueFormatter={(v) => v.toFixed(2)}
                info="How quickly you climb and descend stairs (metres per second), measured by Apple Watch. Higher speeds reflect better lower-body strength and balance."
              />
            </div>
          </div>
        )}
      </QueryView>
    </>
  );
}
