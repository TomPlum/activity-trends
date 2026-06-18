"use client";

import type { LucideIcon } from "lucide-react";
import {
  Flame,
  Footprints,
  Gauge,
  HeartPulse,
  Moon,
  Route,
  Timer,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { useProfile } from "@/lib/queries/profile";
import { useRecords, type RecordDailyRow } from "@/lib/queries/records";
import {
  ageFromDob,
  fitnessAge,
  normaliseSex,
  restingHrRating,
  vo2Rating,
} from "@/lib/health/fitness";
import { buildRecords, type DailyTops } from "@/lib/health/records";
import { PageHeader } from "@/components/dashboard/page-header";
import { CardGridSkeleton, QueryView } from "@/components/dashboard/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const RECORD_ICONS: Record<string, LucideIcon> = {
  Route,
  Zap,
  Flame,
  Footprints,
  Timer,
  Gauge,
  Moon,
  TrendingUp,
};

function topOf(daily: RecordDailyRow[], key: keyof RecordDailyRow) {
  let best: { date: string | null; value: number } | null = null;
  for (const r of daily) {
    const v = r[key];
    if (typeof v !== "number") continue;
    if (best == null || v > best.value) best = { date: r.date, value: v };
  }
  return best;
}

function lastNonNull(daily: RecordDailyRow[], key: keyof RecordDailyRow): number | null {
  for (let i = daily.length - 1; i >= 0; i--) {
    const v = daily[i][key];
    if (typeof v === "number") return v;
  }
  return null;
}

export default function RecordsPage() {
  const recordsQ = useRecords();
  const profileQ = useProfile();

  return (
    <>
      <PageHeader
        title="Records"
        description="Your personal bests, and how your cardio fitness stacks up against the norms for your age."
      />

      <QueryView
        query={recordsQ}
        loading={
          <div className="space-y-6">
            <Skeleton className="h-40 rounded-xl" />
            <CardGridSkeleton count={8} />
          </div>
        }
        isEmpty={(d) => d.workouts.length === 0 && d.daily.length === 0}
      >
        {(data) => {
          const tops: DailyTops = {
            steps: topOf(data.daily, "steps"),
            active_energy: topOf(data.daily, "active_energy"),
            exercise_min: topOf(data.daily, "exercise_min"),
            vo2max: topOf(data.daily, "vo2max"),
            sleep_min: topOf(data.daily, "sleep_min"),
            flights_climbed: topOf(data.daily, "flights_climbed"),
          };
          const records = buildRecords(data.workouts, tops);

          const profile = profileQ.data;
          const sex = normaliseSex(profile?.biological_sex);
          const age = profile?.date_of_birth ? ageFromDob(profile.date_of_birth) : null;
          const vo2 = lastNonNull(data.daily, "vo2max");
          const rhr = lastNonNull(data.daily, "resting_hr");

          return (
            <div className="space-y-8">
              {vo2 != null && (
                <FitnessAgeCard vo2={vo2} rhr={rhr} age={age} sex={sex} />
              )}

              <section>
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                  <Trophy className="h-5 w-5 text-chart-4" />
                  Personal records
                </h2>
                {records.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No records to show yet.</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {records.map((r) => {
                      const Icon = RECORD_ICONS[r.icon] ?? Trophy;
                      return (
                        <Card key={r.key} className="overflow-hidden">
                          <CardContent className="p-5">
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                              <Icon className={cn("h-4 w-4", r.accent)} />
                              {r.label}
                            </div>
                            <p className="mt-2 text-2xl font-semibold tabular-nums">{r.value}</p>
                            {r.detail && (
                              <p className="mt-1 truncate text-xs text-muted-foreground">{r.detail}</p>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          );
        }}
      </QueryView>
    </>
  );
}

function FitnessAgeCard({
  vo2,
  rhr,
  age,
  sex,
}: {
  vo2: number;
  rhr: number | null;
  age: number | null;
  sex: "male" | "female";
}) {
  const fa = fitnessAge(vo2, sex);
  const vo2r = age != null ? vo2Rating(vo2, age, sex) : null;
  const hrr = rhr != null ? restingHrRating(rhr) : null;
  const delta = age != null ? age - fa : null;

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Gauge className="h-4 w-4 text-chart-3" />
          Fitness age
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-10">
        <div>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-semibold tabular-nums leading-none">{fa}</span>
            <span className="pb-1 text-sm text-muted-foreground">years</span>
          </div>
          {delta != null && (
            <p className="mt-2 text-sm text-muted-foreground">
              {delta > 0 ? (
                <span className="font-medium text-emerald-500">{delta} years younger</span>
              ) : delta < 0 ? (
                <span className="font-medium text-rose-500">{Math.abs(delta)} years older</span>
              ) : (
                <span className="font-medium">on par</span>
              )}{" "}
              than your actual age of {age}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <RatingTile
            icon={Gauge}
            label="VO₂ Max"
            value={`${vo2.toFixed(1)}`}
            unit="ml/kg·min"
            rating={vo2r?.label}
            accent={vo2r?.accent ?? "text-chart-3"}
          />
          <RatingTile
            icon={HeartPulse}
            label="Resting HR"
            value={rhr != null ? `${Math.round(rhr)}` : "—"}
            unit="bpm"
            rating={hrr?.label}
            accent={hrr?.accent ?? "text-chart-4"}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function RatingTile({
  icon: Icon,
  label,
  value,
  unit,
  rating,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  unit: string;
  rating?: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className={cn("h-3.5 w-3.5", accent)} />
        {label}
      </div>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums leading-none">
        {value} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
      </p>
      {rating && <p className={cn("mt-1.5 text-xs font-medium", accent)}>{rating}</p>}
    </div>
  );
}
