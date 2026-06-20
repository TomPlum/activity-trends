"use client";

import { useMemo, useState } from "react";
import {
  Footprints,
  Route,
  Flame,
  Mountain,
  Timer,
  Bike,
  HeartPulse,
  CalendarDays,
  Activity,
} from "lucide-react";
import { useDailyMetrics, type DailyMetric } from "@/lib/queries/metrics";
import { PageHeader } from "@/components/dashboard/page-header";
import { RangeSelect } from "@/components/dashboard/range-select";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { ConfigurableTrendChart, type ChartMetric } from "@/components/charts/configurable-trend-chart";
import { ChartTypeToggle, type ChartType } from "@/components/charts/chart-type-toggle";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { ChartHeader } from "@/components/dashboard/chart-header";
import { CardGridSkeleton, ChartSkeleton, QueryView } from "@/components/dashboard/states";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { RangeKey } from "@/lib/queries/ranges";
import * as fmt from "@/lib/format";
import { mean, sum, deltaPct } from "@/lib/stats";
import { energyComposition, weekdayAverages, type EnergyPart } from "@/lib/activity";

export default function ActivityPage() {
  const [range, setRange] = useState<RangeKey>("90d");
  const query = useDailyMetrics(range);

  return (
    <>
      <PageHeader
        title="Activity & Movement"
        description="Steps, distance, the energy you burn and how your movement varies day to day."
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
        {(m) => <ActivityDashboard metrics={m} />}
      </QueryView>
    </>
  );
}

function ActivityDashboard({ metrics }: { metrics: DailyMetric[] }) {
  const energy = useMemo(() => energyComposition(metrics), [metrics]);

  // Days where the Apple exercise ring closed (≥30 min brisk activity).
  const exerciseClosed = useMemo(
    () => metrics.filter((d) => (d.exercise_min ?? 0) >= 30).length,
    [metrics],
  );
  const totalCycling = useMemo(() => sum(metrics.map((d) => d.distance_cycling_km)), [metrics]);
  const hasCycling = totalCycling > 0;
  const hasWalkingHr = useMemo(() => metrics.some((d) => d.walking_hr_avg != null), [metrics]);

  // Average steps grouped by weekday (Mon-first).
  const stepsByDay = useMemo(
    () => weekdayAverages(metrics, "steps").map((w) => ({ day: w.day, steps: w.value })),
    [metrics],
  );

  // Resting + active burn per day for the stacked energy chart.
  const burn = useMemo(
    () =>
      metrics.map((d) => ({
        date: String(d.date),
        resting: d.basal_energy ?? 0,
        active: d.active_energy ?? 0,
      })),
    [metrics],
  );

  // Per-metric series for the movement-metrics selector.
  const movement: ChartMetric[] = useMemo(() => {
    const fromKey = (key: keyof DailyMetric): Array<{ date: string; value: number | null }> =>
      metrics.map((d) => ({ date: String(d.date), value: (d[key] as number | null) ?? null }));
    const has = (key: keyof DailyMetric) => metrics.some((d) => d[key] != null);

    const list: ChartMetric[] = [
      { key: "steps", label: "Steps", color: "var(--chart-1)", icon: Footprints, data: fromKey("steps"), valueFormatter: (v) => fmt.compactNumber(v) },
      { key: "distance_km", label: "Distance", unit: "km", color: "var(--chart-2)", icon: Route, data: fromKey("distance_km"), valueFormatter: (v) => v.toFixed(1) },
      { key: "active_energy", label: "Active energy", unit: "kcal", color: "var(--chart-3)", icon: Flame, data: fromKey("active_energy"), valueFormatter: (v) => v.toFixed(0) },
      { key: "exercise_min", label: "Exercise minutes", unit: "min", color: "var(--workout)", icon: Timer, data: fromKey("exercise_min"), valueFormatter: (v) => v.toFixed(0) },
      { key: "flights_climbed", label: "Flights climbed", color: "var(--chart-5)", icon: Mountain, data: fromKey("flights_climbed"), valueFormatter: (v) => v.toFixed(0) },
    ];
    if (has("stand_hours"))
      list.push({ key: "stand_hours", label: "Stand hours", unit: "h", color: "var(--chart-2)", icon: Activity, data: fromKey("stand_hours"), valueFormatter: (v) => v.toFixed(0) });
    if (hasCycling)
      list.push({ key: "distance_cycling_km", label: "Cycling distance", unit: "km", color: "var(--chart-4)", icon: Bike, data: fromKey("distance_cycling_km"), valueFormatter: (v) => v.toFixed(1) });
    if (hasWalkingHr)
      list.push({ key: "walking_hr_avg", label: "Walking heart rate", unit: "bpm", color: "var(--chart-4)", icon: HeartPulse, data: fromKey("walking_hr_avg"), valueFormatter: (v) => v.toFixed(0) });
    return list;
  }, [metrics, hasCycling, hasWalkingHr]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Avg daily steps"
          value={fmt.number(mean(metrics.map((d) => d.steps)))}
          icon={Footprints}
          accent="text-chart-1"
          delta={deltaPct(metrics.map((d) => d.steps), 7)}
          spark={{ data: metrics, dataKey: "steps", color: "var(--chart-1)" }}
          sub={`${fmt.compactNumber(sum(metrics.map((d) => d.steps)))} total`}
        />
        <StatCard
          label="Avg active energy"
          value={fmt.number(mean(metrics.map((d) => d.active_energy)))}
          unit="kcal"
          icon={Flame}
          accent="text-chart-3"
          delta={deltaPct(metrics.map((d) => d.active_energy), 7)}
          spark={{ data: metrics, dataKey: "active_energy", color: "var(--chart-3)" }}
        />
        <StatCard
          label="Avg exercise"
          value={fmt.number(mean(metrics.map((d) => d.exercise_min)))}
          unit="min"
          icon={Timer}
          accent="text-[color:var(--workout)]"
          delta={deltaPct(metrics.map((d) => d.exercise_min), 7)}
          spark={{ data: metrics, dataKey: "exercise_min", color: "var(--workout)" }}
          sub={`${exerciseClosed}/${metrics.length} days ≥30m`}
        />
        <StatCard
          label="Total distance"
          value={fmt.number(sum(metrics.map((d) => d.distance_km)))}
          unit="km"
          icon={Route}
          accent="text-chart-2"
          spark={{ data: metrics, dataKey: "distance_km", color: "var(--chart-2)" }}
          sub={hasCycling ? `+${fmt.number(totalCycling)} km cycling` : undefined}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <ChartHeader
            icon={Flame}
            iconClass="text-chart-3"
            title="Energy composition"
            description={
              energy.hasResting
                ? `Average day · ${fmt.number(energy.totalKcal)} kcal burned`
                : "Average day · active calories only"
            }
            info="How the calories you burn on an average day split between resting (basal) energy — what your body uses just staying alive — and active energy from movement. Shown as kcal per day and as a share of total burn."
          />
          <CardContent>
            <EnergyCompositionView energy={energy} />
          </CardContent>
        </Card>

        <StepsChart data={metrics} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <ChartHeader
            icon={CalendarDays}
            iconClass="text-chart-1"
            title="Steps by day of week"
            description="Average steps · spot your most active days"
            info="Average daily steps grouped by the day of the week. Surfaces routine patterns — a quieter desk-bound midweek, or busier, more active weekends."
          />
          <CardContent>
            <TrendChart
              data={stepsByDay}
              xKey="day"
              height={260}
              valueFormatter={(v) => fmt.compactNumber(v)}
              series={[{ key: "steps", label: "Avg steps", type: "bar", color: "var(--chart-1)" }]}
            />
          </CardContent>
        </Card>

        <Card>
          <ChartHeader
            icon={Flame}
            iconClass="text-chart-3"
            title="Daily energy burn"
            description="Resting + active calories each day"
            info="Total calories burned each day, stacked into resting (basal) energy and the active energy you add through movement. The full height is your total daily burn."
          />
          <CardContent>
            <TrendChart
              data={burn}
              height={260}
              valueFormatter={(v) => `${fmt.compactNumber(v)}`}
              series={[
                ...(energy.hasResting
                  ? [{ key: "resting", label: "Resting", type: "area" as const, color: "var(--chart-4)", stackId: "e", unit: "kcal" }]
                  : []),
                { key: "active", label: "Active", type: "area", color: "var(--chart-3)", stackId: "e", unit: "kcal" },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Movement metrics</CardTitle>
          <CardDescription>
            Pick a metric to chart over the selected range.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConfigurableTrendChart
            metrics={movement}
            defaultType="bar"
            height={280}
            info="Switch between every movement metric your devices record — steps, distance, active energy, exercise minutes, flights climbed and more — and toggle between bar, line and area views."
          />
        </CardContent>
      </Card>

      <RecentDays metrics={metrics} />
    </div>
  );
}

interface EnergyInfo {
  blurb: string;
}

const ENERGY_INFO: Record<EnergyPart["key"], EnergyInfo> = {
  resting: {
    blurb:
      "Basal energy — the calories your body burns at rest just to keep you alive: breathing, circulation and organ function. It scales with body size and is usually the larger share of the day.",
  },
  active: {
    blurb:
      "The calories you burn through movement on top of resting — every step, workout and bit of fidgeting. This is the figure behind the red Move ring.",
  },
};

/**
 * A single-element segmented bar via a hard-stop linear gradient — avoids the
 * hairline seams you get between fractional-width flex children. Returns
 * undefined when there's nothing to show so the caller can fall back to the
 * muted track. (Mirrors the Sleep page's stage-composition bar.)
 */
function barGradient(parts: Array<{ pct: number; color: string }>): string | undefined {
  const visible = parts.filter((p) => p.pct > 0);
  if (!visible.length) return undefined;
  let acc = 0;
  const stops = visible.map((p) => {
    const stop = `${p.color} ${acc}% ${acc + p.pct}%`;
    acc += p.pct;
    return stop;
  });
  return `linear-gradient(90deg, ${stops.join(", ")})`;
}

function EnergyCompositionView({ energy }: { energy: ReturnType<typeof energyComposition> }) {
  const parts = energy.hasResting ? energy.parts : energy.parts.filter((p) => p.key === "active");
  return (
    <div className="space-y-5">
      <div className="h-6 w-full rounded-md bg-muted" style={{ background: barGradient(parts) }} />
      <ul className="space-y-4">
        {parts.map((p) => (
          <li key={p.key} className="space-y-1.5 border-t pt-3 first:border-t-0 first:pt-0">
            <div className="flex items-baseline gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 translate-y-[1px] rounded-full"
                style={{ backgroundColor: p.color }}
              />
              <span className="font-medium">{p.label}</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {fmt.number(p.avgKcal)} kcal/day
              </span>
              <span className="ml-auto text-lg font-semibold tabular-nums">{p.pct.toFixed(0)}%</span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{ENERGY_INFO[p.key].blurb}</p>
          </li>
        ))}
      </ul>
      {!energy.hasResting && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          Resting (basal) energy isn&apos;t recorded in this range, so only active calories are shown.
        </p>
      )}
    </div>
  );
}

function StepsChart({ data }: { data: DailyMetric[] }) {
  const [type, setType] = useState<ChartType>("bar");
  return (
    <Card className="flex flex-col lg:col-span-2">
      <ChartHeader
        icon={Footprints}
        iconClass="text-chart-1"
        title="Daily steps"
        info="Total steps counted each day by your iPhone and Apple Watch over the selected range. Switch between bar, line and area views with the toggle."
        actions={<ChartTypeToggle value={type} onChange={setType} />}
      />
      <CardContent className="flex min-h-[320px] flex-1 flex-col">
        <TrendChart
          data={data}
          height="100%"
          valueFormatter={(v) => fmt.compactNumber(v)}
          series={[{ key: "steps", label: "Steps", color: "var(--chart-1)", type }]}
        />
      </CardContent>
    </Card>
  );
}

function RecentDays({ metrics }: { metrics: DailyMetric[] }) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  // Most-recent first.
  const ordered = useMemo(() => metrics.slice().reverse(), [metrics]);
  const maxSteps = useMemo(() => Math.max(1, ...metrics.map((d) => d.steps ?? 0)), [metrics]);
  const total = ordered.length;
  const rows = ordered.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">Recent days</CardTitle>
        <CardDescription>Every recorded day in this range</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-6 py-2 font-medium">Day</th>
                <th className="px-3 py-2 text-right font-medium">Steps</th>
                <th className="px-3 py-2 text-right font-medium">Distance</th>
                <th className="px-3 py-2 text-right font-medium">Active</th>
                <th className="px-3 py-2 text-right font-medium">Exercise</th>
                <th className="px-3 py-2 text-right font-medium">Flights</th>
                <th className="px-6 py-2 font-medium">Steps vs best</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={String(d.date)} className="border-b last:border-0 hover:bg-accent/40">
                  <td className="whitespace-nowrap px-6 py-2.5 font-medium">{fmt.shortDate(d.date)}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">
                    {d.steps != null ? fmt.number(d.steps) : "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">
                    {d.distance_km != null ? `${fmt.number(d.distance_km, 1)} km` : "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">
                    {d.active_energy != null ? `${fmt.number(d.active_energy)} kcal` : "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">
                    {d.exercise_min != null ? `${fmt.number(d.exercise_min)} min` : "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">
                    {d.flights_climbed != null ? fmt.number(d.flights_climbed) : "—"}
                  </td>
                  <td className="px-6 py-2.5">
                    <IntensityBar value={d.steps ?? 0} max={maxSteps} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(0);
          }}
        />
      </CardContent>
    </Card>
  );
}

function IntensityBar({ value, max }: { value: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  if (value <= 0) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: "var(--chart-1)" }} />
    </div>
  );
}
