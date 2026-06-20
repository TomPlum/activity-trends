"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Activity, ChevronRight, Droplets, Gauge, HeartPulse, Wind, Footprints } from "lucide-react";
import { useDailyMetrics, type DailyMetric } from "@/lib/queries/metrics";
import { useEcgList } from "@/lib/queries/ecg";
import { useProfile } from "@/lib/queries/profile";
import { PageHeader } from "@/components/dashboard/page-header";
import { RangeSelect } from "@/components/dashboard/range-select";
import { StatCard } from "@/components/dashboard/stat-card";
import { ReadinessCard } from "@/components/dashboard/readiness-card";
import { computeReadiness } from "@/lib/health/readiness";
import {
  ageFromDob,
  fitnessAge,
  normaliseSex,
  restingHrRating,
  vo2Rating,
  type Rating,
} from "@/lib/health/fitness";
import { StyleableTrendChart } from "@/components/charts/styleable-trend-chart";
import { ConfigurableTrendChart, type ChartMetric } from "@/components/charts/configurable-trend-chart";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { CardGridSkeleton, ChartSkeleton, QueryView } from "@/components/dashboard/states";
import { ChartHeader } from "@/components/dashboard/chart-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { RangeKey } from "@/lib/queries/ranges";
import * as fmt from "@/lib/format";
import { mean, latest, deltaPct } from "@/lib/stats";
import { cn } from "@/lib/utils";

export default function HeartPage() {
  const [range, setRange] = useState<RangeKey>("90d");
  const query = useDailyMetrics(range);
  const profileQ = useProfile();

  return (
    <>
      <PageHeader
        title="Heart & Vitals"
        description="Resting heart rate, variability, cardio fitness and respiratory trends."
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
        {(m) => <HeartDashboard metrics={m} profile={profileQ.data} />}
      </QueryView>

      <EcgSection />
    </>
  );
}

function HeartDashboard({
  metrics,
  profile,
}: {
  metrics: DailyMetric[];
  profile: { date_of_birth: string | null; biological_sex: string | null } | null | undefined;
}) {
  const readiness = useMemo(() => computeReadiness(metrics), [metrics]);

  const vo2 = latest(metrics.map((d) => d.vo2max));
  const rhr = latest(metrics.map((d) => d.resting_hr));
  const sex = normaliseSex(profile?.biological_sex);
  const age = profile?.date_of_birth ? ageFromDob(profile.date_of_birth) : null;

  const hasWalkingHr = metrics.some((d) => d.walking_hr_avg != null);

  const vitals: ChartMetric[] = useMemo(() => {
    const fromKey = (key: keyof DailyMetric): Array<{ date: string; value: number | null }> =>
      metrics.map((d) => ({ date: String(d.date), value: (d[key] as number | null) ?? null }));
    const has = (key: keyof DailyMetric) => metrics.some((d) => d[key] != null);

    const list: ChartMetric[] = [
      { key: "resting_hr", label: "Resting HR", unit: "bpm", color: "var(--chart-4)", icon: HeartPulse, data: fromKey("resting_hr"), valueFormatter: (v) => v.toFixed(0) },
      { key: "hrv_ms", label: "HRV (SDNN)", unit: "ms", color: "var(--chart-1)", icon: Activity, data: fromKey("hrv_ms"), valueFormatter: (v) => v.toFixed(0) },
      { key: "vo2max", label: "VO₂ Max", unit: "ml/kg·min", color: "var(--chart-3)", icon: Gauge, data: fromKey("vo2max"), valueFormatter: (v) => v.toFixed(1) },
    ];
    if (has("blood_oxygen"))
      list.push({ key: "blood_oxygen", label: "Blood oxygen", unit: "%", color: "var(--chart-2)", icon: Droplets, data: fromKey("blood_oxygen"), valueFormatter: (v) => v.toFixed(1) });
    if (has("respiratory_rate"))
      list.push({ key: "respiratory_rate", label: "Respiratory rate", unit: "br/min", color: "var(--chart-2)", icon: Wind, data: fromKey("respiratory_rate"), valueFormatter: (v) => v.toFixed(1) });
    if (hasWalkingHr)
      list.push({ key: "walking_hr_avg", label: "Walking heart rate", unit: "bpm", color: "var(--chart-4)", icon: Footprints, data: fromKey("walking_hr_avg"), valueFormatter: (v) => v.toFixed(0) });
    return list;
  }, [metrics, hasWalkingHr]);

  const recent = useMemo(
    () =>
      metrics.filter(
        (d) =>
          d.resting_hr != null ||
          d.hrv_ms != null ||
          d.vo2max != null ||
          d.blood_oxygen != null ||
          d.respiratory_rate != null,
      ),
    [metrics],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Resting HR" value={fmt.number(rhr)} unit="bpm" icon={HeartPulse} accent="text-chart-4" delta={deltaPct(metrics.map((d) => d.resting_hr), 7)} invertDelta spark={{ data: metrics, dataKey: "resting_hr", color: "var(--chart-4)" }} />
        <StatCard label="HRV (SDNN)" value={fmt.number(latest(metrics.map((d) => d.hrv_ms)))} unit="ms" icon={Activity} accent="text-chart-1" delta={deltaPct(metrics.map((d) => d.hrv_ms), 7)} spark={{ data: metrics, dataKey: "hrv_ms", color: "var(--chart-1)" }} />
        <StatCard label="VO₂ Max" value={fmt.number(vo2, 1)} unit="ml/kg·min" icon={Gauge} accent="text-chart-3" spark={{ data: metrics, dataKey: "vo2max", color: "var(--chart-3)" }} />
        <StatCard label="Blood oxygen" value={fmt.number(mean(metrics.map((d) => d.blood_oxygen)), 1)} unit="%" icon={Droplets} accent="text-chart-2" spark={{ data: metrics, dataKey: "blood_oxygen", color: "var(--chart-2)" }} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <ChartHeader
            icon={Gauge}
            iconClass="text-chart-1"
            title="Readiness"
            info="A 0–100 daily score blending HRV, resting heart rate, sleep and the previous day's exercise load against your own recent baseline. Higher means better recovered and readier to train."
          />
          <CardContent>
            <ReadinessCard days={readiness} />
          </CardContent>
        </Card>
        <StyleableTrendChart
          className="lg:col-span-2"
          title="Resting heart rate & HRV"
          data={metrics}
          defaultType="line"
          series={[
            { key: "resting_hr", label: "Resting HR", color: "var(--chart-4)", unit: "bpm" },
            { key: "hrv_ms", label: "HRV", color: "var(--chart-1)", unit: "ms" },
          ]}
          info="Resting heart rate (beats per minute, lower is generally fitter) and heart rate variability (SDNN in milliseconds, higher generally signals better recovery), tracked together over time."
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <ChartHeader
            icon={Gauge}
            iconClass="text-chart-3"
            title="Cardio fitness"
            description={vo2 != null ? "VO₂ Max vs your age & sex" : "Needs VO₂ Max data"}
            info="How your cardio fitness stacks up against population norms for your age and sex. Fitness age is the age at which the median VO₂ Max equals yours — lower is fitter. Ratings band your VO₂ Max and resting heart rate."
          />
          <CardContent>
            {vo2 != null ? (
              <CardioFitness vo2={vo2} rhr={rhr} age={age} sex={sex} />
            ) : (
              <div className="flex h-[200px] items-center justify-center text-center text-sm text-muted-foreground">
                No VO₂ Max recorded in this range.
              </div>
            )}
          </CardContent>
        </Card>
        <StyleableTrendChart
          className="lg:col-span-2"
          title="VO₂ Max"
          data={metrics}
          series={[{ key: "vo2max", label: "VO₂ Max", color: "var(--chart-3)", unit: "ml/kg" }]}
          valueFormatter={(v) => v.toFixed(0)}
          info="Estimated maximum oxygen uptake (ml/kg/min) — Apple's measure of cardio fitness. It moves slowly; a rising trend means your aerobic fitness is improving."
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StyleableTrendChart
          title={
            <>
              <Wind className="h-4 w-4 text-chart-2" /> Respiratory rate
            </>
          }
          data={metrics}
          height={260}
          defaultType="line"
          series={[{ key: "respiratory_rate", label: "Respiratory rate", color: "var(--chart-2)", unit: "br/min" }]}
          valueFormatter={(v) => v.toFixed(0)}
          info="Breaths per minute, mostly measured during sleep. A stable resting rate is normal; a sustained jump can accompany illness, stress or poor recovery."
        />
        <StyleableTrendChart
          title={
            <>
              <Droplets className="h-4 w-4 text-chart-2" /> Blood oxygen
            </>
          }
          data={metrics}
          height={260}
          defaultType="line"
          series={[{ key: "blood_oxygen", label: "Blood oxygen", color: "var(--chart-2)", unit: "%" }]}
          valueFormatter={(v) => `${v.toFixed(0)}%`}
          info="Blood oxygen saturation (SpO₂) sampled by Apple Watch, mostly at rest. Healthy readings sit around 95–100%; occasional dips are normal."
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Heart &amp; vitals metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <ConfigurableTrendChart
            metrics={vitals}
            defaultType="line"
            height={280}
            info="Pick any cardiovascular or respiratory metric to chart over the range — resting HR, HRV, VO₂ Max, blood oxygen, respiratory rate and walking heart rate — and toggle between line, bar and area views."
          />
        </CardContent>
      </Card>

      <RecentVitals metrics={recent} />
    </div>
  );
}

function CardioFitness({
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
    <div className="space-y-5">
      <div>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-semibold tabular-nums leading-none">{fa}</span>
          <span className="pb-1 text-sm text-muted-foreground">fitness age</span>
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
            than your age of {age}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <RatingTile icon={Gauge} label="VO₂ Max" value={vo2.toFixed(1)} unit="ml/kg" rating={vo2r} fallback="text-chart-3" />
        <RatingTile icon={HeartPulse} label="Resting HR" value={rhr != null ? `${Math.round(rhr)}` : "—"} unit="bpm" rating={hrr} fallback="text-chart-4" />
      </div>
    </div>
  );
}

function RatingTile({
  icon: Icon,
  label,
  value,
  unit,
  rating,
  fallback,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
  unit: string;
  rating: Rating | null;
  fallback: string;
}) {
  const accent = rating?.accent ?? fallback;
  return (
    <div className="rounded-xl border bg-muted/20 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className={cn("h-3.5 w-3.5", accent)} />
        {label}
      </div>
      <p className="mt-1.5 text-xl font-semibold tabular-nums leading-none">
        {value} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
      </p>
      {rating && <p className={cn("mt-1.5 text-xs font-medium", accent)}>{rating.label}</p>}
    </div>
  );
}

function RecentVitals({ metrics }: { metrics: DailyMetric[] }) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const ordered = useMemo(() => metrics.slice().reverse(), [metrics]);
  const total = ordered.length;
  const rows = ordered.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">Recent vitals</CardTitle>
        <CardDescription>Every day with cardiovascular readings in this range</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-6 py-2 font-medium">Day</th>
                <th className="px-3 py-2 text-right font-medium">Resting HR</th>
                <th className="px-3 py-2 text-right font-medium">HRV</th>
                <th className="px-3 py-2 text-right font-medium">VO₂ Max</th>
                <th className="px-3 py-2 text-right font-medium">SpO₂</th>
                <th className="px-6 py-2 text-right font-medium">Resp. rate</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={String(d.date)} className="border-b last:border-0 hover:bg-accent/40">
                  <td className="whitespace-nowrap px-6 py-2.5 font-medium">{fmt.shortDate(d.date)}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">
                    {d.resting_hr != null ? `${fmt.number(d.resting_hr)} bpm` : "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">
                    {d.hrv_ms != null ? `${fmt.number(d.hrv_ms)} ms` : "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">
                    {d.vo2max != null ? fmt.number(d.vo2max, 1) : "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">
                    {d.blood_oxygen != null ? `${fmt.number(d.blood_oxygen, 1)}%` : "—"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-2.5 text-right tabular-nums">
                    {d.respiratory_rate != null ? `${fmt.number(d.respiratory_rate, 1)}` : "—"}
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

function EcgSection() {
  const { data, isPending } = useEcgList();
  if (!isPending && (!data || data.length === 0)) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <HeartPulse className="h-4 w-4 text-chart-4" /> ECG recordings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isPending
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)
          : data!.map((e) => (
              <Link
                key={e.id}
                href={`/ecg/${e.id}`}
                className="flex items-center justify-between rounded-lg border px-3 py-2 transition-colors hover:bg-accent/50"
              >
                <div>
                  <p className="text-sm font-medium">{fmt.shortDate(e.recorded_at)}</p>
                  <p className="text-xs text-muted-foreground">{fmt.timeOfDay(e.recorded_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  {e.classification && <Badge variant="secondary">{e.classification}</Badge>}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
      </CardContent>
    </Card>
  );
}
