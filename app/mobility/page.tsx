"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Footprints,
  Gauge,
  PersonStanding,
  TrendingUpDown,
  CalendarDays,
  Footprints as Stairs,
} from "lucide-react";
import { useDailyMetrics, type DailyMetric } from "@/lib/queries/metrics";
import { PageHeader } from "@/components/dashboard/page-header";
import { RangeSelect } from "@/components/dashboard/range-select";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { StyleableTrendChart } from "@/components/charts/styleable-trend-chart";
import { ConfigurableTrendChart, type ChartMetric } from "@/components/charts/configurable-trend-chart";
import { ChartTypeToggle, type ChartType } from "@/components/charts/chart-type-toggle";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { ChartHeader } from "@/components/dashboard/chart-header";
import { CardGridSkeleton, ChartSkeleton, QueryView } from "@/components/dashboard/states";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { RangeKey } from "@/lib/queries/ranges";
import * as fmt from "@/lib/format";
import { mean, latest, deltaPct } from "@/lib/stats";
import { weekdayAverages } from "@/lib/activity";
import { STEADINESS_BANDS, steadinessRating } from "@/lib/health/mobility";
import { cn } from "@/lib/utils";

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
        {(m) => <MobilityDashboard metrics={m} />}
      </QueryView>
    </>
  );
}

function MobilityDashboard({ metrics }: { metrics: DailyMetric[] }) {
  const steadiness = latest(metrics.map((d) => d.walking_steadiness_pct));
  const steadinessBand = steadinessRating(steadiness);

  const speedByDay = useMemo(
    () => weekdayAverages(metrics, "walking_speed_kmh").map((w) => ({ day: w.day, speed: w.value })),
    [metrics],
  );

  const mobilityMetrics: ChartMetric[] = useMemo(() => {
    const fromKey = (key: keyof DailyMetric): Array<{ date: string; value: number | null }> =>
      metrics.map((d) => ({ date: String(d.date), value: (d[key] as number | null) ?? null }));
    const has = (key: keyof DailyMetric) => metrics.some((d) => d[key] != null);

    const list: ChartMetric[] = [
      { key: "walking_speed_kmh", label: "Walking speed", unit: "km/h", color: "var(--chart-1)", icon: Gauge, data: fromKey("walking_speed_kmh"), valueFormatter: (v) => v.toFixed(1) },
      { key: "step_length_cm", label: "Step length", unit: "cm", color: "var(--chart-3)", icon: Footprints, data: fromKey("step_length_cm"), valueFormatter: (v) => v.toFixed(0) },
    ];
    if (has("walking_steadiness_pct"))
      list.push({ key: "walking_steadiness_pct", label: "Walking steadiness", unit: "%", color: "var(--chart-2)", icon: PersonStanding, data: fromKey("walking_steadiness_pct"), valueFormatter: (v) => v.toFixed(0) });
    if (has("walking_asymmetry_pct"))
      list.push({ key: "walking_asymmetry_pct", label: "Asymmetry", unit: "%", color: "var(--chart-4)", icon: TrendingUpDown, data: fromKey("walking_asymmetry_pct"), valueFormatter: (v) => v.toFixed(0) });
    if (has("double_support_pct"))
      list.push({ key: "double_support_pct", label: "Double support", unit: "%", color: "var(--chart-5)", icon: Activity, data: fromKey("double_support_pct"), valueFormatter: (v) => v.toFixed(0) });
    if (has("stair_ascent_speed"))
      list.push({ key: "stair_ascent_speed", label: "Stair ascent", unit: "m/s", color: "var(--chart-1)", icon: Stairs, data: fromKey("stair_ascent_speed"), valueFormatter: (v) => v.toFixed(2) });
    if (has("stair_descent_speed"))
      list.push({ key: "stair_descent_speed", label: "Stair descent", unit: "m/s", color: "var(--chart-2)", icon: Stairs, data: fromKey("stair_descent_speed"), valueFormatter: (v) => v.toFixed(2) });
    return list;
  }, [metrics]);

  const recent = useMemo(
    () =>
      metrics.filter(
        (d) =>
          d.walking_speed_kmh != null ||
          d.step_length_cm != null ||
          d.walking_steadiness_pct != null ||
          d.walking_asymmetry_pct != null,
      ),
    [metrics],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Walking speed" value={fmt.number(mean(metrics.map((d) => d.walking_speed_kmh)), 1)} unit="km/h" icon={Gauge} accent="text-chart-1" delta={deltaPct(metrics.map((d) => d.walking_speed_kmh), 7)} spark={{ data: metrics, dataKey: "walking_speed_kmh", color: "var(--chart-1)" }} />
        <StatCard label="Step length" value={fmt.number(mean(metrics.map((d) => d.step_length_cm)), 1)} unit="cm" icon={Footprints} accent="text-chart-3" delta={deltaPct(metrics.map((d) => d.step_length_cm), 7)} spark={{ data: metrics, dataKey: "step_length_cm", color: "var(--chart-3)" }} />
        <StatCard
          label="Walking steadiness"
          value={fmt.number(steadiness, 1)}
          unit="%"
          icon={PersonStanding}
          accent="text-chart-2"
          spark={{ data: metrics, dataKey: "walking_steadiness_pct", color: "var(--chart-2)" }}
          sub={steadinessBand ? <span className={steadinessBand.accent}>{steadinessBand.label}</span> : undefined}
        />
        <StatCard label="Asymmetry" value={fmt.number(mean(metrics.map((d) => d.walking_asymmetry_pct)), 1)} unit="%" icon={TrendingUpDown} accent="text-chart-4" delta={deltaPct(metrics.map((d) => d.walking_asymmetry_pct), 7)} invertDelta spark={{ data: metrics, dataKey: "walking_asymmetry_pct", color: "var(--chart-4)" }} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <ChartHeader
            icon={PersonStanding}
            iconClass="text-chart-2"
            title="Walking steadiness"
            description={steadinessBand ? `Currently ${steadinessBand.label.toLowerCase()}` : "No steadiness data"}
            info="Apple's walking-steadiness assessment of your fall risk from gait quality, banded OK / Low / Very Low. Low or Very Low suggests balance and stability worth discussing with a clinician."
          />
          <CardContent>
            {steadiness != null ? (
              <SteadinessClassification pct={steadiness} />
            ) : (
              <div className="flex h-[200px] items-center justify-center text-center text-sm text-muted-foreground">
                No walking-steadiness data in this range.
              </div>
            )}
          </CardContent>
        </Card>

        <GaitChart data={metrics} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StyleableTrendChart
          title={
            <>
              <Activity className="h-4 w-4 text-chart-4" /> Gait symmetry
            </>
          }
          data={metrics}
          height={260}
          defaultType="line"
          series={[
            { key: "walking_asymmetry_pct", label: "Asymmetry %", color: "var(--chart-4)" },
            { key: "double_support_pct", label: "Double support %", color: "var(--chart-5)" },
          ]}
          valueFormatter={(v) => `${v.toFixed(0)}%`}
          info="Walking asymmetry is the percentage of time your steps are uneven between legs; double support is the share of each stride with both feet on the ground. Lower is steadier — both rise with fatigue or injury."
        />
        <Card>
          <ChartHeader
            icon={CalendarDays}
            iconClass="text-chart-1"
            title="Walking speed by day of week"
            description="Average pace per weekday"
            info="Average walking pace grouped by the day of the week. Useful for spotting whether busier or more sedentary days change how briskly you move."
          />
          <CardContent>
            <TrendChart
              data={speedByDay}
              xKey="day"
              height={260}
              valueFormatter={(v) => `${v.toFixed(1)}`}
              series={[{ key: "speed", label: "Avg speed", type: "bar", color: "var(--chart-1)" }]}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mobility metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <ConfigurableTrendChart
            metrics={mobilityMetrics}
            defaultType="line"
            height={280}
            info="Pick any gait metric to chart over the range — walking speed, step length, steadiness, asymmetry, double support and stair speeds — and toggle between line, bar and area views."
          />
        </CardContent>
      </Card>

      <RecentDays metrics={recent} />
    </div>
  );
}

function SteadinessClassification({ pct }: { pct: number }) {
  const band = steadinessRating(pct);
  const pos = Math.max(0, Math.min(100, pct));
  const tint: Record<string, string> = {
    very_low: "bg-rose-500/40",
    low: "bg-amber-500/40",
    ok: "bg-emerald-500/40",
  };
  const segs = STEADINESS_BANDS.map((b) => ({
    ...b,
    width: (b.max === Infinity ? 100 : b.max) - b.min,
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-end gap-2">
        <span className="text-4xl font-semibold tabular-nums leading-none">{pct.toFixed(0)}</span>
        <span className="pb-1 text-sm text-muted-foreground">%</span>
        {band && <span className={cn("pb-1 text-sm font-medium", band.accent)}>{band.label}</span>}
      </div>
      <div className="relative pt-4">
        <div className="flex h-3 w-full overflow-hidden rounded-full">
          {segs.map((s) => (
            <div key={s.key} className={tint[s.key]} style={{ width: `${s.width}%` }} />
          ))}
        </div>
        <div
          className="absolute top-2.5 h-4 w-0.5 -translate-x-1/2 rounded-full bg-foreground"
          style={{ left: `${pos}%` }}
        />
      </div>
      <ul className="space-y-1.5 text-xs">
        {STEADINESS_BANDS.map((b) => (
          <li key={b.key} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <span className={cn("h-2 w-2 rounded-full", tint[b.key])} />
              <span className={band?.key === b.key ? cn("font-medium", b.accent) : "text-muted-foreground"}>
                {b.label}
              </span>
            </span>
            <span className="tabular-nums text-muted-foreground">
              {b.max === Infinity ? `${b.min}%+` : `${b.min}–${b.max}%`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GaitChart({ data }: { data: DailyMetric[] }) {
  const [type, setType] = useState<ChartType>("line");
  return (
    <Card className="flex flex-col lg:col-span-2">
      <ChartHeader
        icon={Gauge}
        iconClass="text-chart-1"
        title="Walking speed & step length"
        info="Your average walking pace (km/h) and how far you travel per step (cm). Both are gauges of gait health — they tend to dip when you're tired, injured or unwell. Switch between line, bar and area views."
        actions={<ChartTypeToggle value={type} onChange={setType} />}
      />
      <CardContent className="flex min-h-[320px] flex-1 flex-col">
        <TrendChart
          data={data}
          height="100%"
          valueFormatter={(v) => v.toFixed(0)}
          series={[
            { key: "walking_speed_kmh", label: "Speed (km/h)", color: "var(--chart-1)", type },
            { key: "step_length_cm", label: "Step length (cm)", color: "var(--chart-3)", type },
          ]}
        />
      </CardContent>
    </Card>
  );
}

function RecentDays({ metrics }: { metrics: DailyMetric[] }) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const ordered = useMemo(() => metrics.slice().reverse(), [metrics]);
  const total = ordered.length;
  const rows = ordered.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">Recent days</CardTitle>
        <CardDescription>Every day with gait readings in this range</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-6 py-2 font-medium">Day</th>
                <th className="px-3 py-2 text-right font-medium">Speed</th>
                <th className="px-3 py-2 text-right font-medium">Step length</th>
                <th className="px-3 py-2 text-right font-medium">Steadiness</th>
                <th className="px-6 py-2 text-right font-medium">Asymmetry</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={String(d.date)} className="border-b last:border-0 hover:bg-accent/40">
                  <td className="whitespace-nowrap px-6 py-2.5 font-medium">{fmt.shortDate(d.date)}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">
                    {d.walking_speed_kmh != null ? `${fmt.number(d.walking_speed_kmh, 1)} km/h` : "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">
                    {d.step_length_cm != null ? `${fmt.number(d.step_length_cm)} cm` : "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">
                    {d.walking_steadiness_pct != null ? `${fmt.number(d.walking_steadiness_pct)}%` : "—"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-2.5 text-right tabular-nums">
                    {d.walking_asymmetry_pct != null ? `${fmt.number(d.walking_asymmetry_pct, 1)}%` : "—"}
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
