"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  CalendarCheck,
  Flame,
  Footprints,
  Gauge,
  HeartPulse,
  Moon,
  Route,
  Timer,
  TrendingDown,
  TrendingUp,
  Trophy,
  Wind,
} from "lucide-react";
import { Lightbulb } from "lucide-react";
import { useOverview } from "@/lib/queries/overview";
import { useWorkouts } from "@/lib/queries/workouts";
import { deriveInsights } from "@/lib/insights/engine";
import { computeReadiness } from "@/lib/health/readiness";
import { InsightList } from "@/components/dashboard/insight-list";
import { ReadinessCard } from "@/components/dashboard/readiness-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityRings } from "@/components/dashboard/activity-rings";
import { StreakHeatmap } from "@/components/dashboard/streak-heatmap";
import { WorkoutIcon } from "@/components/dashboard/workout-icon";
import { Sparkline } from "@/components/charts/sparkline";
import { TrendChart } from "@/components/charts/trend-chart";
import { CardGridSkeleton, QueryView } from "@/components/dashboard/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import * as fmt from "@/lib/format";
import { latest, mean, sum, deltaPct, streakStats } from "@/lib/stats";
import { workoutMeta, CATEGORY_ACCENT } from "@/lib/health/workout-types";
import { cn } from "@/lib/utils";

export default function OverviewPage() {
  const overview = useOverview();
  const recentWorkouts = useWorkouts({ range: "30d" });

  return (
    <>
      <PageHeader
        title="Overview"
        description="Your health at a glance — Apple Watch & Health data across the past year."
      />

      <QueryView
        query={overview}
        loading={
          <div className="space-y-6">
            <Skeleton className="h-44 rounded-xl" />
            <CardGridSkeleton />
          </div>
        }
        isEmpty={(d) => d.recentMetrics.length === 0 && !d.latestActivity && !d.lastWorkout}
      >
        {(data) => {
          const year = data.recentMetrics;
          const m = year.slice(-90); // sparklines + KPI cards use the recent 90 days
          const m30 = year.slice(-30);
          const steps = m.map((d) => d.steps);
          const energy = m.map((d) => d.active_energy);
          const restingHr = m.map((d) => d.resting_hr);

          const act = data.latestActivity;

          // Year totals for the "This year" strip.
          const totals = {
            steps: sum(year.map((d) => d.steps)),
            distanceKm: sum(year.map((d) => d.distance_km)),
            activeEnergy: sum(year.map((d) => d.active_energy)),
            exerciseMin: sum(year.map((d) => d.exercise_min)),
          };

          // Slow-moving series get the full year (filtered to logged days).
          const vo2Series = year.filter((d) => d.vo2max != null);
          const weightSeries = year.filter((d) => d.weight_kg != null);
          const hasVo2 = vo2Series.length > 1;
          const hasWeight = weightSeries.length > 1;

          // Full-year exercise for the streak heatmap. A day counts toward the
          // streak when the Apple exercise ring is closed (≥30 min). Heatmap
          // intensity scales 0..1 against a 60-min day so rest days show as gaps.
          const exerciseByDay: Record<string, number> = {};
          const activeDates = new Set<string>();
          for (const row of year) {
            if (!row.date) continue;
            const ex = row.exercise_min ?? 0;
            exerciseByDay[row.date] = Math.min(ex / 60, 1);
            if (ex >= 30) activeDates.add(row.date);
          }
          const streak = streakStats(activeDates);
          const insights = deriveInsights(year);
          const readiness = computeReadiness(year);

          return (
            <div className="space-y-6">
              {/* Hero */}
              <Card className="overflow-hidden">
                <CardContent className="grid gap-6 p-6 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-10">
                  <div className="flex items-center justify-center gap-5 sm:justify-start">
                    <ActivityRings
                      size={140}
                      move={{
                        value: act?.active_energy_kcal ?? 0,
                        goal: act?.active_energy_goal ?? 600,
                      }}
                      exercise={{ value: act?.exercise_min ?? 0, goal: act?.exercise_goal ?? 30 }}
                      stand={{ value: act?.stand_hours ?? 0, goal: act?.stand_goal ?? 12 }}
                    />
                    <div className="space-y-1.5 text-sm">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {act?.date ? fmt.shortDate(act.date) : "Latest rings"}
                      </p>
                      <RingStat color="var(--chart-4)" label="Move" value={`${fmt.number(act?.active_energy_kcal)} kcal`} />
                      <RingStat color="var(--chart-1)" label="Exercise" value={fmt.duration(act?.exercise_min)} />
                      <RingStat color="var(--chart-2)" label="Stand" value={`${fmt.number(act?.stand_hours)} h`} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <HeroVital
                      icon={HeartPulse}
                      label="Resting HR"
                      value={fmt.number(data.latest.restingHr)}
                      unit="bpm"
                      color="text-chart-4"
                      delta={deltaPct(restingHr, 7)}
                      invertDelta
                      spark={{ data: m, dataKey: "resting_hr", color: "var(--chart-4)" }}
                    />
                    <HeroVital
                      icon={Activity}
                      label="HRV"
                      value={fmt.number(data.latest.hrv)}
                      unit="ms"
                      color="text-chart-1"
                      delta={deltaPct(m.map((d) => d.hrv_ms), 7)}
                      spark={{ data: m, dataKey: "hrv_ms", color: "var(--chart-1)" }}
                    />
                    <HeroVital
                      icon={Gauge}
                      label="VO₂ Max"
                      value={fmt.number(data.latest.vo2max, 1)}
                      unit="ml/kg"
                      color="text-chart-3"
                      spark={{ data: vo2Series, dataKey: "vo2max", color: "var(--chart-3)" }}
                    />
                    <HeroVital
                      icon={Wind}
                      label="Weight"
                      value={fmt.number(data.latest.weightKg, 1)}
                      unit="kg"
                      color="text-chart-5"
                      spark={{ data: weightSeries, dataKey: "weight_kg", color: "var(--chart-5)" }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* This year totals */}
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="text-base">This year</CardTitle>
                  <span className="text-xs text-muted-foreground">Last 365 days</span>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <MiniStat icon={Footprints} accent="text-chart-1" label="Total steps" value={fmt.compactNumber(totals.steps)} />
                  <MiniStat icon={Route} accent="text-chart-2" label="Distance" value={fmt.number(totals.distanceKm)} unit="km" />
                  <MiniStat icon={Flame} accent="text-chart-3" label="Active energy" value={fmt.compactNumber(totals.activeEnergy)} unit="kcal" />
                  <MiniStat icon={Timer} accent="text-chart-4" label="Exercise time" value={fmt.number(totals.exerciseMin / 60)} unit="h" />
                </CardContent>
              </Card>

              {/* KPI sparkline cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Avg daily steps"
                  value={fmt.number(mean(steps))}
                  icon={Footprints}
                  accent="text-chart-1"
                  delta={deltaPct(steps, 7)}
                  spark={{ data: m, dataKey: "steps", color: "var(--chart-1)" }}
                />
                <StatCard
                  label="Avg active energy"
                  value={fmt.number(mean(energy))}
                  unit="kcal"
                  icon={Flame}
                  accent="text-chart-3"
                  delta={deltaPct(energy, 7)}
                  spark={{ data: m, dataKey: "active_energy", color: "var(--chart-3)" }}
                />
                <StatCard
                  label="Resting HR"
                  value={fmt.number(latest(restingHr))}
                  unit="bpm"
                  icon={HeartPulse}
                  accent="text-chart-4"
                  delta={deltaPct(restingHr, 7)}
                  invertDelta
                  spark={{ data: m, dataKey: "resting_hr", color: "var(--chart-4)" }}
                />
                <StatCard
                  label="Avg sleep"
                  value={fmt.duration(mean(m.map((d) => d.sleep_min)))}
                  icon={Moon}
                  accent="text-chart-2"
                  delta={deltaPct(m.map((d) => d.sleep_min), 7)}
                  spark={{ data: m, dataKey: "sleep_min", color: "var(--chart-2)" }}
                />
              </div>

              {/* Insights + readiness */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardHeader className="flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Lightbulb className="h-4 w-4 text-chart-3" />
                      Insights
                    </CardTitle>
                    <Link href="/insights" className="text-xs text-muted-foreground hover:text-foreground">
                      View all →
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <InsightList insights={insights.slice(0, 3)} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Gauge className="h-4 w-4 text-chart-1" />
                      Readiness
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">Today</span>
                  </CardHeader>
                  <CardContent>
                    <ReadinessCard days={readiness} />
                  </CardContent>
                </Card>
              </div>

              {/* Heatmap + recent workouts */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardHeader className="flex-row items-center justify-between">
                    <CardTitle className="text-base">Activity streak</CardTitle>
                    <span className="text-xs text-muted-foreground">Past year</span>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid grid-cols-3 gap-3">
                      <StreakStat
                        icon={Flame}
                        accent="text-chart-1"
                        label="Current streak"
                        value={fmt.number(streak.current)}
                        unit={streak.current === 1 ? "day" : "days"}
                      />
                      <StreakStat
                        icon={Trophy}
                        accent="text-chart-3"
                        label="Longest streak"
                        value={fmt.number(streak.longest)}
                        unit={streak.longest === 1 ? "day" : "days"}
                      />
                      <StreakStat
                        icon={CalendarCheck}
                        accent="text-chart-2"
                        label="Active days"
                        value={fmt.number(streak.activeDays)}
                        unit={`/ ${year.length}`}
                      />
                    </div>
                    <StreakHeatmap values={exerciseByDay} colorVar="--chart-1" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex-row items-center justify-between">
                    <CardTitle className="text-base">Recent workouts</CardTitle>
                    <Link href="/workouts" className="text-xs text-muted-foreground hover:text-foreground">
                      View all →
                    </Link>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {recentWorkouts.isPending ? (
                      Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)
                    ) : recentWorkouts.data && recentWorkouts.data.length > 0 ? (
                      recentWorkouts.data.slice(0, 5).map((w) => {
                        const meta = workoutMeta(w.activity_type);
                        return (
                          <div key={w.id} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                <WorkoutIcon name={meta.icon} className={cn("h-4 w-4", CATEGORY_ACCENT[meta.category])} />
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">{meta.label}</p>
                                <p className="text-xs text-muted-foreground">{fmt.relativeTime(w.start_time)}</p>
                              </div>
                            </div>
                            <div className="text-right text-xs text-muted-foreground">
                              <p className="font-medium text-foreground">{fmt.number(w.energy_kcal)} kcal</p>
                              <p>{fmt.duration(w.duration_min)}</p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="py-6 text-center text-sm text-muted-foreground">No workouts in range.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Trends */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <TrendCard title="Heart health" subtitle="Last 90 days">
                  <TrendChart
                    height={220}
                    data={m}
                    series={[
                      { key: "resting_hr", label: "Resting HR", type: "line", color: "var(--chart-4)", unit: "bpm" },
                      { key: "hrv_ms", label: "HRV", type: "line", color: "var(--chart-1)", unit: "ms" },
                    ]}
                  />
                </TrendCard>

                <TrendCard title="Sleep duration" subtitle="Last 30 days">
                  <TrendChart
                    height={220}
                    data={m30}
                    valueFormatter={(v) => `${Math.round(v / 60)}h`}
                    series={[{ key: "sleep_min", label: "Sleep", type: "bar", color: "var(--chart-2)" }]}
                  />
                </TrendCard>

                {hasVo2 && (
                  <TrendCard title="Cardio fitness" subtitle="VO₂ Max · past year">
                    <TrendChart
                      height={220}
                      data={vo2Series}
                      series={[{ key: "vo2max", label: "VO₂ Max", type: "area", color: "var(--chart-3)", unit: "ml/kg" }]}
                    />
                  </TrendCard>
                )}

                {hasWeight && (
                  <TrendCard title="Body weight" subtitle="Past year">
                    <TrendChart
                      height={220}
                      data={weightSeries}
                      valueFormatter={(v) => `${v.toFixed(0)}`}
                      series={[{ key: "weight_kg", label: "Weight", type: "area", color: "var(--chart-5)", unit: "kg" }]}
                    />
                  </TrendCard>
                )}
              </div>
            </div>
          );
        }}
      </QueryView>
    </>
  );
}

function RingStat({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto font-medium tabular-nums">{value}</span>
    </div>
  );
}

function Delta({ value, invert = false }: { value: number; invert?: boolean }) {
  const up = value >= 0;
  const good = invert ? !up : up;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[11px] font-medium",
        good ? "text-emerald-500" : "text-rose-500",
      )}
    >
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function HeroVital({
  icon: Icon,
  label,
  value,
  unit,
  color,
  delta,
  invertDelta = false,
  spark,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  unit: string;
  color: string;
  delta?: number | null;
  invertDelta?: boolean;
  spark?: { data: Array<Record<string, number | null | string>>; dataKey: string; color?: string };
}) {
  const hasDelta = delta != null && Number.isFinite(delta);
  return (
    <div className="rounded-xl border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-1.5">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon className={cn("h-3.5 w-3.5", color)} />
          {label}
        </span>
        {hasDelta && <Delta value={delta as number} invert={invertDelta} />}
      </div>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums leading-none">
        {value} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
      </p>
      {spark && (
        <div className="mt-2">
          <Sparkline data={spark.data} dataKey={spark.dataKey} color={spark.color} height={28} />
        </div>
      )}
    </div>
  );
}

function MiniStat({
  icon: Icon,
  accent,
  label,
  value,
  unit,
}: {
  icon: LucideIcon;
  accent: string;
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className={cn("h-3.5 w-3.5", accent)} />
        {label}
      </div>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums leading-none">
        {value}
        {unit && <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span>}
      </p>
    </div>
  );
}

function TrendCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">{title}</CardTitle>
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function StreakStat({
  icon: Icon,
  accent,
  label,
  value,
  unit,
}: {
  icon: typeof Activity;
  accent: string;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className={cn("h-3.5 w-3.5", accent)} />
        {label}
      </div>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums leading-none">
        {value}{" "}
        <span className="text-xs font-normal text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}
