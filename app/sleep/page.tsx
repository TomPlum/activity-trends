"use client";

import { useMemo, useState } from "react";
import {
  Moon,
  Gauge,
  BedDouble,
  Sunrise,
  CalendarDays,
  Clock,
  Thermometer,
  Wind,
  Droplets,
  HeartPulse,
  Activity,
  Hourglass,
} from "lucide-react";
import { useSleepSessions, type SleepSession } from "@/lib/queries/sleep";
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
import { mean, deltaPct } from "@/lib/stats";
import {
  circularTimeStats,
  clockFromNoonHours,
  clockLabel,
  efficiencyPct,
  hoursSinceAnchorNoon,
  minutesIntoDay,
  stageBreakdown,
  weekdayAverages,
  type StageStat,
} from "@/lib/sleep";

export default function SleepPage() {
  const [range, setRange] = useState<RangeKey>("90d");
  const query = useSleepSessions(range);
  const dailyQuery = useDailyMetrics(range);

  return (
    <>
      <PageHeader
        title="Sleep"
        description="Sleep stages, quality, schedule and how your nights track your recovery."
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
        {(sessions) => (
          <SleepDashboard sessions={sessions} daily={dailyQuery.data ?? []} />
        )}
      </QueryView>
    </>
  );
}

function SleepDashboard({
  sessions,
  daily: dailyMetrics,
}: {
  sessions: SleepSession[];
  daily: DailyMetric[];
}) {
  // Per-night series for charts and sparklines.
  const data = useMemo(
    () =>
      sessions.map((s) => ({
        date: s.start_time.slice(0, 10),
        deep: s.deep_min ?? 0,
        rem: s.rem_min ?? 0,
        light: s.light_min ?? 0,
        awake: s.awake_min ?? 0,
        duration_min: s.duration_min ?? null,
        quality_pct: s.quality_pct ?? null,
      })),
    [sessions],
  );

  const bedtimes = circularTimeStats(sessions.map((s) => minutesIntoDay(s.start_time)));
  const waketimes = circularTimeStats(
    sessions.map((s) => (s.end_time ? minutesIntoDay(s.end_time) : null)),
  );
  const { stages, totalMin } = stageBreakdown(sessions);
  const weekday = weekdayAverages(sessions);

  // Bedtime / wake-up laid onto one continuous evening→morning axis.
  const schedule = useMemo(
    () =>
      sessions
        .filter((s) => s.end_time)
        .map((s) => ({
          date: s.start_time.slice(0, 10),
          bedtime: hoursSinceAnchorNoon(s.start_time, s.start_time),
          wake: hoursSinceAnchorNoon(s.end_time as string, s.start_time),
        })),
    [sessions],
  );

  // Sleep & recovery vitals — per-night quality/duration alongside the
  // overnight physiology rolled up into daily_metrics.
  const vitals: ChartMetric[] = useMemo(() => {
    const fromDaily = (key: keyof DailyMetric): Array<{ date: string; value: number | null }> =>
      dailyMetrics.map((d) => ({ date: String(d.date), value: (d[key] as number | null) ?? null }));
    const hasDaily = (key: keyof DailyMetric) => dailyMetrics.some((d) => d[key] != null);

    const list: ChartMetric[] = [
      {
        key: "efficiency",
        label: "Sleep efficiency",
        unit: "%",
        color: "var(--chart-1)",
        icon: Gauge,
        data: sessions.map((s) => ({ date: s.start_time.slice(0, 10), value: efficiencyPct(s) })),
        valueFormatter: (v) => v.toFixed(0),
      },
      {
        key: "asleep",
        label: "Time asleep",
        unit: "h",
        color: "var(--chart-2)",
        icon: Hourglass,
        data: sessions.map((s) => ({
          date: s.start_time.slice(0, 10),
          value: s.duration_min != null ? s.duration_min / 60 : null,
        })),
        valueFormatter: (v) => v.toFixed(1),
      },
    ];
    if (hasDaily("sleeping_wrist_temp_c"))
      list.push({ key: "wrist_temp", label: "Wrist temperature", unit: "°C", color: "var(--chart-4)", icon: Thermometer, data: fromDaily("sleeping_wrist_temp_c"), valueFormatter: (v) => v.toFixed(1) });
    if (hasDaily("respiratory_rate"))
      list.push({ key: "resp", label: "Respiratory rate", unit: "br/min", color: "var(--chart-2)", icon: Wind, data: fromDaily("respiratory_rate"), valueFormatter: (v) => v.toFixed(1) });
    if (hasDaily("blood_oxygen"))
      list.push({ key: "spo2", label: "Blood oxygen", unit: "%", color: "var(--chart-3)", icon: Droplets, data: fromDaily("blood_oxygen"), valueFormatter: (v) => v.toFixed(1) });
    if (hasDaily("resting_hr"))
      list.push({ key: "resting_hr", label: "Resting HR", unit: "bpm", color: "var(--chart-4)", icon: HeartPulse, data: fromDaily("resting_hr"), valueFormatter: (v) => v.toFixed(0) });
    if (hasDaily("hrv_ms"))
      list.push({ key: "hrv", label: "HRV", unit: "ms", color: "var(--chart-1)", icon: Activity, data: fromDaily("hrv_ms"), valueFormatter: (v) => v.toFixed(0) });
    return list;
  }, [sessions, dailyMetrics]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Avg time asleep"
          value={fmt.duration(mean(sessions.map((s) => s.duration_min)))}
          icon={BedDouble}
          accent="text-chart-2"
          delta={deltaPct(data.map((d) => d.duration_min), 7)}
          spark={{ data, dataKey: "duration_min", color: "var(--chart-2)" }}
          sub={`${sessions.length} nights`}
        />
        <StatCard
          label="Avg efficiency"
          value={fmt.number(mean(sessions.map((s) => efficiencyPct(s))))}
          unit="%"
          icon={Gauge}
          accent="text-chart-1"
          delta={deltaPct(data.map((d) => d.quality_pct), 7)}
          spark={{ data, dataKey: "quality_pct", color: "var(--chart-1)" }}
        />
        <StatCard
          label="Avg bedtime"
          value={clockLabel(bedtimes.mean)}
          icon={Moon}
          accent="text-chart-5"
          sub={bedtimes.stdev != null ? `±${Math.round(bedtimes.stdev)}m consistency` : undefined}
        />
        <StatCard
          label="Avg wake-up"
          value={clockLabel(waketimes.mean)}
          icon={Sunrise}
          accent="text-chart-3"
          sub={waketimes.stdev != null ? `±${Math.round(waketimes.stdev)}m consistency` : undefined}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <ChartHeader
            title="Stage composition"
            description={`Average night · ${fmt.duration(totalMin)} in bed`}
            info="How an average night breaks down across the four sleep stages — deep, REM, light and time awake — shown as minutes per night and as a share of time in bed, with the typical healthy range for each."
          />
          <CardContent>
            <StageComposition stages={stages} />
          </CardContent>
        </Card>

        <SleepStagesChart data={data} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <ChartHeader
            icon={Clock}
            iconClass="text-chart-5"
            title="Sleep schedule"
            description="When you fell asleep and woke each night"
            info="Your bedtime and wake-up time for each night, plotted on one continuous evening-to-morning axis. The gap between the two lines is how long you slept; flat, parallel lines mean a consistent routine."
          />
          <CardContent>
            <TrendChart
              data={schedule}
              height={260}
              valueFormatter={clockFromNoonHours}
              series={[
                { key: "bedtime", label: "Bedtime", type: "line", color: "var(--chart-5)" },
                { key: "wake", label: "Wake-up", type: "line", color: "var(--chart-3)" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <ChartHeader
            icon={CalendarDays}
            iconClass="text-chart-2"
            title="By day of week"
            description="Average hours asleep · spot weekend catch-up"
            info="Average hours asleep grouped by the day of the week the night began. Taller weekend bars suggest you're catching up on sleep debt built up during the week."
          />
          <CardContent>
            <TrendChart
              data={weekday.map((w) => ({ day: w.day, hours: w.hours }))}
              xKey="day"
              height={260}
              valueFormatter={(v) => `${v.toFixed(1)}h`}
              series={[{ key: "hours", label: "Avg asleep", type: "bar", color: "var(--chart-2)" }]}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sleep & recovery vitals</CardTitle>
          <CardDescription>
            Per-night sleep quality alongside the physiology measured overnight.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConfigurableTrendChart
            metrics={vitals}
            defaultType="line"
            height={280}
            info="Pick a metric to chart over the selected range. Per-night sleep efficiency and time asleep sit alongside the physiology measured while you slept — wrist temperature, respiratory rate, blood oxygen, resting heart rate and HRV — so you can eyeball how they move together."
          />
        </CardContent>
      </Card>

      <RecentNights sessions={sessions} />
    </div>
  );
}

interface StageInfo {
  blurb: string;
  /** Typical share of the night for a healthy adult, as a 0–100 range. */
  typical: [number, number];
  typicalLabel: string;
}

const STAGE_INFO: Record<StageStat["key"], StageInfo> = {
  deep: {
    blurb:
      "The most physically restorative stage — the body repairs tissue, builds muscle and bone, and consolidates the immune system. Hardest to wake from.",
    typical: [13, 23],
    typicalLabel: "13–23%",
  },
  rem: {
    blurb:
      "Dreaming sleep. Consolidates memory, supports learning and creativity, and helps regulate mood. Concentrated in the second half of the night.",
    typical: [20, 25],
    typicalLabel: "20–25%",
  },
  light: {
    blurb:
      "The bulk of the night. Bridges the deeper stages, relaxes muscles and slows the heart, and still contributes to memory and recovery.",
    typical: [45, 55],
    typicalLabel: "45–55%",
  },
  awake: {
    blurb:
      "Brief awakenings after first falling asleep. A small amount is completely normal; a high share can point to fragmented, restless sleep.",
    typical: [0, 10],
    typicalLabel: "under 10%",
  },
};

function SleepStagesChart({ data }: { data: Array<Record<string, number | null | string>> }) {
  const [type, setType] = useState<ChartType>("area");
  return (
    <Card className="flex flex-col lg:col-span-2">
      <ChartHeader
        title="Sleep stages"
        info="Each night's sleep split into deep, REM, light and awake minutes, stacked so the full height is the total time tracked. Switch between area, bar and line views with the toggle."
        actions={<ChartTypeToggle value={type} onChange={setType} />}
      />
      <CardContent className="flex min-h-[320px] flex-1 flex-col">
        <TrendChart
          data={data}
          height="100%"
          valueFormatter={(v) => `${Math.round(v / 60)}h`}
          series={[
            { key: "deep", label: "Deep", color: "var(--chart-5)", type, stackId: "s" },
            { key: "rem", label: "REM", color: "var(--chart-3)", type, stackId: "s" },
            { key: "light", label: "Light", color: "var(--chart-2)", type, stackId: "s" },
            { key: "awake", label: "Awake", color: "var(--chart-4)", type, stackId: "s" },
          ]}
        />
      </CardContent>
    </Card>
  );
}

/**
 * A single-element segmented bar via a hard-stop linear gradient. Avoids the
 * hairline anti-alias seams you get between fractional-width flex children, and
 * keeps every segment perfectly flush and full-height. Returns undefined when
 * there's nothing to show so the caller can fall back to the muted track.
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

function StageComposition({ stages }: { stages: StageStat[] }) {
  return (
    <div className="space-y-5">
      <div className="h-6 w-full rounded-md bg-muted" style={{ background: barGradient(stages) }} />
      <ul className="space-y-4">
        {stages.map((s) => {
          const info = STAGE_INFO[s.key];
          const inRange = s.pct >= info.typical[0] && s.pct <= info.typical[1];
          return (
            <li key={s.key} className="space-y-1.5 border-t pt-3 first:border-t-0 first:pt-0">
              <div className="flex items-baseline gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 translate-y-[1px] rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="font-medium">{s.label}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {fmt.duration(s.avgMin)}/night
                </span>
                <span className="ml-auto text-lg font-semibold tabular-nums">
                  {s.pct.toFixed(0)}%
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{info.blurb}</p>
              <p className="text-xs">
                <span className="text-muted-foreground">Typical {info.typicalLabel} · </span>
                <span className={inRange ? "text-emerald-500" : "text-amber-500"}>
                  {inRange ? "in range" : "outside range"}
                </span>
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RecentNights({ sessions }: { sessions: SleepSession[] }) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  // Most-recent first.
  const ordered = useMemo(() => sessions.slice().reverse(), [sessions]);
  const total = ordered.length;
  const rows = ordered.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">Recent nights</CardTitle>
        <CardDescription>Every recorded night in this range</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-6 py-2 font-medium">Night</th>
                <th className="px-3 py-2 font-medium">Bedtime</th>
                <th className="px-3 py-2 font-medium">Wake</th>
                <th className="px-3 py-2 text-right font-medium">Asleep</th>
                <th className="px-3 py-2 text-right font-medium">Efficiency</th>
                <th className="px-6 py-2 font-medium">Stages</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const eff = efficiencyPct(s);
                return (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-accent/40">
                    <td className="whitespace-nowrap px-6 py-2.5 font-medium">
                      {fmt.shortDate(s.start_time)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-muted-foreground">
                      {fmt.timeOfDay(s.start_time)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-muted-foreground">
                      {s.end_time ? fmt.timeOfDay(s.end_time) : "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">
                      {fmt.duration(s.duration_min)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">
                      {eff != null ? `${eff.toFixed(0)}%` : "—"}
                    </td>
                    <td className="px-6 py-2.5">
                      <StageBar session={s} />
                    </td>
                  </tr>
                );
              })}
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

function StageBar({ session }: { session: SleepSession }) {
  const segs = [
    { min: session.deep_min ?? 0, color: "var(--chart-5)" },
    { min: session.rem_min ?? 0, color: "var(--chart-3)" },
    { min: session.light_min ?? 0, color: "var(--chart-2)" },
    { min: session.awake_min ?? 0, color: "var(--chart-4)" },
  ];
  const total = segs.reduce((sum, s) => sum + s.min, 0);
  if (total === 0) return <span className="text-xs text-muted-foreground">—</span>;
  const parts = segs.map((s) => ({ pct: (s.min / total) * 100, color: s.color }));
  return (
    <div
      className="h-2 w-full rounded-full bg-muted"
      style={{ background: barGradient(parts) }}
    />
  );
}
