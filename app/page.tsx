"use client";

import Link from "next/link";
import { Activity, Flame, Footprints, Gauge, HeartPulse, Moon, Wind } from "lucide-react";
import { useOverview } from "@/lib/queries/overview";
import { useWorkouts } from "@/lib/queries/workouts";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityRings } from "@/components/dashboard/activity-rings";
import { StreakHeatmap } from "@/components/dashboard/streak-heatmap";
import { CardGridSkeleton, QueryView } from "@/components/dashboard/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import * as fmt from "@/lib/format";
import { latest, mean, deltaPct } from "@/lib/stats";
import { workoutMeta } from "@/lib/health/workout-types";

export default function OverviewPage() {
  const overview = useOverview();
  const recentWorkouts = useWorkouts({ range: "30d" });

  return (
    <>
      <PageHeader
        title="Overview"
        description="Your health at a glance — the last 90 days of Apple Watch & Health data."
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
          const m = data.recentMetrics;
          const steps = m.map((d) => d.steps);
          const energy = m.map((d) => d.active_energy);
          const restingHr = m.map((d) => d.resting_hr);

          const act = data.latestActivity;
          const exerciseByDay: Record<string, number> = {};
          for (const row of m) {
            const v = row.active_energy ?? row.steps ?? 0;
            if (row.date) exerciseByDay[row.date] = v;
          }
          const maxStreakVal = Math.max(1, ...Object.values(exerciseByDay));

          return (
            <div className="space-y-6">
              {/* Hero */}
              <Card className="overflow-hidden">
                <CardContent className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:gap-10">
                  {act ? (
                    <div className="flex items-center gap-5">
                      <ActivityRings
                        size={132}
                        move={{
                          value: act.active_energy_kcal ?? 0,
                          goal: act.active_energy_goal ?? 600,
                        }}
                        exercise={{ value: act.exercise_min ?? 0, goal: act.exercise_goal ?? 30 }}
                        stand={{ value: act.stand_hours ?? 0, goal: act.stand_goal ?? 12 }}
                      />
                      <div className="space-y-1 text-sm">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {act.date ? fmt.shortDate(act.date) : "Latest rings"}
                        </p>
                        <RingStat color="var(--chart-4)" label="Move" value={`${fmt.number(act.active_energy_kcal)} kcal`} />
                        <RingStat color="var(--chart-1)" label="Exercise" value={fmt.duration(act.exercise_min)} />
                        <RingStat color="var(--chart-2)" label="Stand" value={`${fmt.number(act.stand_hours)} h`} />
                      </div>
                    </div>
                  ) : (
                    <ActivityRings size={132} move={{ value: 0, goal: 1 }} exercise={{ value: 0, goal: 1 }} stand={{ value: 0, goal: 1 }} />
                  )}

                  <div className="h-px w-full bg-border sm:h-24 sm:w-px" />

                  <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
                    <HeroVital icon={HeartPulse} label="Resting HR" value={fmt.number(data.latest.restingHr)} unit="bpm" color="text-chart-4" />
                    <HeroVital icon={Activity} label="HRV" value={fmt.number(data.latest.hrv)} unit="ms" color="text-chart-1" />
                    <HeroVital icon={Gauge} label="VO₂ Max" value={fmt.number(data.latest.vo2max, 1)} unit="ml/kg" color="text-chart-3" />
                    <HeroVital icon={Wind} label="Weight" value={fmt.number(data.latest.weightKg, 1)} unit="kg" color="text-chart-5" />
                  </div>
                </CardContent>
              </Card>

              {/* KPI sparkline cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

              {/* Heatmap + recent workouts */}
              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">Activity streak</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StreakHeatmap
                      values={Object.fromEntries(
                        Object.entries(exerciseByDay).map(([k, v]) => [k, v / maxStreakVal]),
                      )}
                      colorVar="--chart-1"
                    />
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
                          <div key={w.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{meta.label}</p>
                              <p className="text-xs text-muted-foreground">{fmt.relativeTime(w.start_time)}</p>
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

function HeroVital({
  icon: Icon,
  label,
  value,
  unit,
  color,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className={`h-3.5 w-3.5 ${color}`} />
        {label}
      </div>
      <p className="mt-1 text-xl font-semibold tabular-nums">
        {value} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}
