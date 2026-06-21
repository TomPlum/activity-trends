"use client";

import { useMemo, useState } from "react";
import { Percent, Ruler, Scale, Dumbbell, Activity } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RangeKey } from "@/lib/queries/ranges";
import * as fmt from "@/lib/format";
import { latest, deltaPct } from "@/lib/stats";
import { barGradient } from "@/lib/segments";
import { BMI_BANDS, bmiCategory, bmiScalePosition, bodyComposition } from "@/lib/health/body";
import { cn } from "@/lib/utils";

/** Compact in-card placeholder for a metric Apple Health didn't record. */
function NoReadings({ metric }: { metric: string }) {
  return (
    <div className="flex h-[240px] flex-col items-center justify-center gap-1 text-center">
      <p className="text-sm font-medium text-muted-foreground">No {metric} readings</p>
      <p className="max-w-xs text-xs text-muted-foreground">
        Your Apple Health export contains no {metric} data — these come from a smart scale or
        manual entry.
      </p>
    </div>
  );
}

export default function BodyPage() {
  const [range, setRange] = useState<RangeKey>("1y");
  const query = useDailyMetrics(range);

  return (
    <>
      <PageHeader
        title="Body"
        description="Weight, BMI and body composition over time."
        actions={<RangeSelect value={range} onChange={setRange} />}
      />

      <QueryView
        query={query}
        loading={
          <div className="space-y-6">
            <CardGridSkeleton count={3} />
            <ChartSkeleton />
          </div>
        }
        isEmpty={(d) => d.every((r) => r.weight_kg == null && r.bmi == null && r.body_fat_pct == null)}
      >
        {(m) => <BodyDashboard metrics={m} />}
      </QueryView>
    </>
  );
}

function BodyDashboard({ metrics }: { metrics: DailyMetric[] }) {
  const hasBmi = metrics.some((d) => d.bmi != null);
  const hasBodyFat = metrics.some((d) => d.body_fat_pct != null);

  const latestWeight = latest(metrics.map((d) => d.weight_kg));
  const latestBmi = latest(metrics.map((d) => d.bmi));
  const latestFat = latest(metrics.map((d) => d.body_fat_pct));
  const category = bmiCategory(latestBmi);
  const composition = bodyComposition(latestWeight, latestFat);

  // Per-day lean mass, when both weight and body fat are present.
  const leanSeries = useMemo(
    () =>
      metrics.map((d) => ({
        date: String(d.date),
        value:
          d.weight_kg != null && d.body_fat_pct != null
            ? d.weight_kg * (1 - d.body_fat_pct / 100)
            : null,
      })),
    [metrics],
  );
  const hasLean = leanSeries.some((p) => p.value != null);

  const bodyMetrics: ChartMetric[] = useMemo(() => {
    const fromKey = (key: keyof DailyMetric): Array<{ date: string; value: number | null }> =>
      metrics.map((d) => ({ date: String(d.date), value: (d[key] as number | null) ?? null }));
    const list: ChartMetric[] = [
      { key: "weight_kg", label: "Weight", unit: "kg", color: "var(--chart-5)", icon: Scale, data: fromKey("weight_kg"), valueFormatter: (v) => v.toFixed(1) },
    ];
    if (hasBmi)
      list.push({ key: "bmi", label: "BMI", color: "var(--chart-3)", icon: Ruler, data: fromKey("bmi"), valueFormatter: (v) => v.toFixed(1) });
    if (hasBodyFat)
      list.push({ key: "body_fat_pct", label: "Body fat", unit: "%", color: "var(--chart-4)", icon: Percent, data: fromKey("body_fat_pct"), valueFormatter: (v) => v.toFixed(1) });
    if (hasLean)
      list.push({ key: "lean", label: "Lean mass", unit: "kg", color: "var(--chart-2)", icon: Dumbbell, data: leanSeries, valueFormatter: (v) => v.toFixed(1) });
    return list;
  }, [metrics, hasBmi, hasBodyFat, hasLean, leanSeries]);

  // Measurements only — body rows are sparse, so the table shows logged days.
  const measurements = useMemo(
    () => metrics.filter((d) => d.weight_kg != null || d.bmi != null || d.body_fat_pct != null),
    [metrics],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Weight"
          value={fmt.number(latestWeight, 1)}
          unit="kg"
          icon={Scale}
          accent="text-chart-5"
          delta={deltaPct(metrics.map((d) => d.weight_kg), 30)}
          invertDelta
          spark={{ data: metrics, dataKey: "weight_kg", color: "var(--chart-5)" }}
        />
        <StatCard
          label="BMI"
          value={fmt.number(latestBmi, 1)}
          icon={Ruler}
          accent="text-chart-3"
          spark={{ data: metrics, dataKey: "bmi", color: "var(--chart-3)" }}
          sub={category ? <span className={category.accent}>{category.label}</span> : undefined}
        />
        <StatCard
          label="Body fat"
          value={fmt.number(latestFat, 1)}
          unit="%"
          icon={Percent}
          accent="text-chart-4"
          delta={deltaPct(metrics.map((d) => d.body_fat_pct), 30)}
          invertDelta
          spark={{ data: metrics, dataKey: "body_fat_pct", color: "var(--chart-4)" }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <ChartHeader
            icon={Ruler}
            iconClass="text-chart-3"
            title="BMI classification"
            description={category ? `Currently ${category.label.toLowerCase()}` : "No BMI recorded"}
            info="Where your latest Body Mass Index sits across the WHO weight categories. BMI is a rough screen based only on height and weight — it doesn't account for muscle mass, so athletes often read high."
          />
          <CardContent>
            {latestBmi != null ? (
              <BmiClassification bmi={latestBmi} />
            ) : (
              <NoReadings metric="BMI" />
            )}
          </CardContent>
        </Card>

        <WeightChart data={metrics} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <ChartHeader
            icon={Activity}
            iconClass="text-chart-2"
            title="Body composition"
            description={
              composition ? `Latest · ${fmt.number(latestWeight, 1)} kg total` : "Needs body-fat data"
            }
            info="Your most recent weight split into lean mass (muscle, bone, organs and water) and fat mass, derived from your body-fat percentage. Tracking the split matters more than weight alone."
          />
          <CardContent>
            {composition ? (
              <CompositionView parts={composition.parts} />
            ) : (
              <NoReadings metric="body fat" />
            )}
          </CardContent>
        </Card>

        {hasBodyFat ? (
          <StyleableTrendChart
            title="Body fat"
            data={metrics}
            height={240}
            defaultType="line"
            series={[{ key: "body_fat_pct", label: "Body fat", color: "var(--chart-4)", unit: "%" }]}
            valueFormatter={(v) => `${v.toFixed(0)}%`}
            info="Body fat percentage over time. These readings come from a smart scale or manual entry — Apple Watch doesn't measure body composition."
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Body fat</CardTitle>
            </CardHeader>
            <CardContent>
              <NoReadings metric="body fat" />
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Body metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <ConfigurableTrendChart
            metrics={bodyMetrics}
            defaultType="line"
            height={280}
            info="Pick a body metric to chart over the selected range — weight, BMI, body fat and (where available) lean mass — and switch between line, bar and area views."
          />
        </CardContent>
      </Card>

      <RecentMeasurements measurements={measurements} />
    </div>
  );
}

function BmiClassification({ bmi }: { bmi: number }) {
  const pos = bmiScalePosition(bmi);
  const category = bmiCategory(bmi);
  // Segment widths across the fixed 15–40 visual scale.
  const segs = BMI_BANDS.map((b, i) => {
    const start = i === 0 ? 0 : bmiScalePosition(b.min);
    const end = b.max === Infinity ? 100 : bmiScalePosition(b.max);
    return { ...b, width: end - start };
  });
  const tint: Record<string, string> = {
    underweight: "bg-amber-500/30",
    normal: "bg-emerald-500/40",
    overweight: "bg-amber-500/40",
    obese: "bg-rose-500/40",
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-semibold tabular-nums leading-none">{bmi.toFixed(1)}</span>
          {category && (
            <span className={cn("pb-1 text-sm font-medium", category.accent)}>{category.label}</span>
          )}
        </div>
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
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        {BMI_BANDS.map((b) => (
          <li key={b.key} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <span className={cn("h-2 w-2 rounded-full", tint[b.key])} />
              <span className={category?.key === b.key ? cn("font-medium", b.accent) : "text-muted-foreground"}>
                {b.label}
              </span>
            </span>
            <span className="tabular-nums text-muted-foreground">
              {b.max === Infinity ? `${b.min}+` : `${b.min}–${b.max}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CompositionView({
  parts,
}: {
  parts: NonNullable<ReturnType<typeof bodyComposition>>["parts"];
}) {
  const blurb: Record<string, string> = {
    lean: "Everything that isn't fat — muscle, bone, organs and water. Preserving lean mass while losing weight is the goal of healthy body recomposition.",
    fat: "Stored body fat. Some is essential; the healthy range depends on age and sex, and what matters most is the long-term trend.",
  };
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
                {fmt.number(p.kg, 1)} kg
              </span>
              <span className="ml-auto text-lg font-semibold tabular-nums">{p.pct.toFixed(0)}%</span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{blurb[p.key]}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WeightChart({ data }: { data: DailyMetric[] }) {
  const [type, setType] = useState<ChartType>("area");
  return (
    <Card className="flex flex-col lg:col-span-2">
      <ChartHeader
        icon={Scale}
        iconClass="text-chart-5"
        title="Weight"
        info="Body weight over time, in kilograms, from each logged measurement. The range defaults to a year so the trend is easy to see. Switch between area, bar and line views."
        actions={<ChartTypeToggle value={type} onChange={setType} />}
      />
      <CardContent className="flex min-h-[320px] flex-1 flex-col">
        <TrendChart
          data={data}
          height="100%"
          valueFormatter={(v) => v.toFixed(0)}
          series={[{ key: "weight_kg", label: "Weight", color: "var(--chart-5)", unit: "kg", type }]}
        />
      </CardContent>
    </Card>
  );
}

function RecentMeasurements({ measurements }: { measurements: DailyMetric[] }) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const ordered = useMemo(() => measurements.slice().reverse(), [measurements]);
  const total = ordered.length;
  const rows = ordered.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">Recent measurements</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-6 py-2 font-medium">Day</th>
                <th className="px-3 py-2 text-right font-medium">Weight</th>
                <th className="px-3 py-2 text-right font-medium">BMI</th>
                <th className="px-3 py-2 text-right font-medium">Body fat</th>
                <th className="px-6 py-2 text-right font-medium">Lean mass</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => {
                const lean =
                  d.weight_kg != null && d.body_fat_pct != null
                    ? d.weight_kg * (1 - d.body_fat_pct / 100)
                    : null;
                return (
                  <tr key={String(d.date)} className="border-b last:border-0 hover:bg-accent/40">
                    <td className="whitespace-nowrap px-6 py-2.5 font-medium">{fmt.shortDate(d.date)}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">
                      {d.weight_kg != null ? `${fmt.number(d.weight_kg, 1)} kg` : "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">
                      {d.bmi != null ? fmt.number(d.bmi, 1) : "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">
                      {d.body_fat_pct != null ? `${fmt.number(d.body_fat_pct, 1)}%` : "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-2.5 text-right tabular-nums">
                      {lean != null ? `${fmt.number(lean, 1)} kg` : "—"}
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
