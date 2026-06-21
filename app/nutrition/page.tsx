"use client";

import { useMemo, useState } from "react";
import {
  Beef,
  Coffee,
  Croissant,
  Droplet,
  Flame,
  Wheat,
  CalendarDays,
  Candy,
  Leaf,
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
import { mean, deltaPct } from "@/lib/stats";
import { weekdayAverages } from "@/lib/activity";
import { barGradient } from "@/lib/segments";
import { macroComposition, type MacroPart } from "@/lib/nutrition";

export default function NutritionPage() {
  const [range, setRange] = useState<RangeKey>("90d");
  const query = useDailyMetrics(range);

  return (
    <>
      <PageHeader
        title="Nutrition"
        description="Calories, macronutrients and intake logged via Apple Health."
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
        isEmpty={(d) => d.every((r) => r.diet_energy_kcal == null && r.water_ml == null)}
      >
        {(m) => <NutritionDashboard metrics={m} />}
      </QueryView>
    </>
  );
}

function NutritionDashboard({ metrics }: { metrics: DailyMetric[] }) {
  const macros = useMemo(() => macroComposition(metrics), [metrics]);

  const caloriesByDay = useMemo(
    () => weekdayAverages(metrics, "diet_energy_kcal").map((w) => ({ day: w.day, kcal: w.value })),
    [metrics],
  );

  const nutritionMetrics: ChartMetric[] = useMemo(() => {
    const fromKey = (key: keyof DailyMetric): Array<{ date: string; value: number | null }> =>
      metrics.map((d) => ({ date: String(d.date), value: (d[key] as number | null) ?? null }));
    const has = (key: keyof DailyMetric) => metrics.some((d) => d[key] != null);

    const list: ChartMetric[] = [
      { key: "diet_energy_kcal", label: "Calories", unit: "kcal", color: "var(--chart-3)", icon: Flame, data: fromKey("diet_energy_kcal"), valueFormatter: (v) => v.toFixed(0) },
      { key: "protein_g", label: "Protein", unit: "g", color: "var(--chart-4)", icon: Beef, data: fromKey("protein_g"), valueFormatter: (v) => v.toFixed(0) },
      { key: "carbs_g", label: "Carbs", unit: "g", color: "var(--chart-1)", icon: Wheat, data: fromKey("carbs_g"), valueFormatter: (v) => v.toFixed(0) },
      { key: "fat_g", label: "Fat", unit: "g", color: "var(--chart-3)", icon: Croissant, data: fromKey("fat_g"), valueFormatter: (v) => v.toFixed(0) },
    ];
    if (has("sugar_g"))
      list.push({ key: "sugar_g", label: "Sugar", unit: "g", color: "var(--chart-5)", icon: Candy, data: fromKey("sugar_g"), valueFormatter: (v) => v.toFixed(0) });
    if (has("fiber_g"))
      list.push({ key: "fiber_g", label: "Fibre", unit: "g", color: "var(--chart-1)", icon: Leaf, data: fromKey("fiber_g"), valueFormatter: (v) => v.toFixed(0) });
    if (has("water_ml"))
      list.push({ key: "water_ml", label: "Water", unit: "ml", color: "var(--chart-2)", icon: Droplet, data: fromKey("water_ml"), valueFormatter: (v) => v.toFixed(0) });
    if (has("caffeine_mg"))
      list.push({ key: "caffeine_mg", label: "Caffeine", unit: "mg", color: "var(--chart-5)", icon: Coffee, data: fromKey("caffeine_mg"), valueFormatter: (v) => v.toFixed(0) });
    return list;
  }, [metrics]);

  const logged = useMemo(
    () => metrics.filter((d) => d.diet_energy_kcal != null),
    [metrics],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Avg calories"
          value={fmt.number(mean(metrics.map((d) => d.diet_energy_kcal)))}
          unit="kcal"
          icon={Flame}
          accent="text-chart-3"
          delta={deltaPct(metrics.map((d) => d.diet_energy_kcal), 7)}
          spark={{ data: metrics, dataKey: "diet_energy_kcal", color: "var(--chart-3)" }}
        />
        <StatCard
          label="Avg protein"
          value={fmt.number(mean(metrics.map((d) => d.protein_g)))}
          unit="g"
          icon={Beef}
          accent="text-chart-4"
          delta={deltaPct(metrics.map((d) => d.protein_g), 7)}
          spark={{ data: metrics, dataKey: "protein_g", color: "var(--chart-4)" }}
        />
        <StatCard
          label="Avg water"
          value={fmt.number(mean(metrics.map((d) => d.water_ml)))}
          unit="ml"
          icon={Droplet}
          accent="text-chart-2"
          spark={{ data: metrics, dataKey: "water_ml", color: "var(--chart-2)" }}
        />
        <StatCard
          label="Avg caffeine"
          value={fmt.number(mean(metrics.map((d) => d.caffeine_mg)))}
          unit="mg"
          icon={Coffee}
          accent="text-chart-5"
          spark={{ data: metrics, dataKey: "caffeine_mg", color: "var(--chart-5)" }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <ChartHeader
            icon={Wheat}
            iconClass="text-chart-1"
            title="Macro split"
            description={
              macros.hasMacros
                ? `Average day · ${fmt.number(macros.totalKcal)} kcal from macros`
                : "No macros logged"
            }
            info="How your average day's calories divide between carbohydrate, protein and fat, using the standard 4 / 4 / 9 kcal-per-gram energy factors. A balanced split and enough protein are the usual goals."
          />
          <CardContent>
            {macros.hasMacros ? (
              <MacroCompositionView parts={macros.parts} />
            ) : (
              <NoData label="No macronutrients logged in this range." />
            )}
          </CardContent>
        </Card>

        <EnergyIntakeChart data={metrics} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StyleableTrendChart
          title={
            <>
              <Wheat className="h-4 w-4 text-chart-1" /> Macronutrients
            </>
          }
          data={metrics}
          height={260}
          valueFormatter={(v) => `${v.toFixed(0)}g`}
          series={[
            { key: "carbs_g", label: "Carbs", color: "var(--chart-1)", stackId: "m" },
            { key: "protein_g", label: "Protein", color: "var(--chart-4)", stackId: "m" },
            { key: "fat_g", label: "Fat", color: "var(--chart-3)", stackId: "m" },
          ]}
          info="Grams of carbohydrate, protein and fat logged per day, stacked so the full bar is your total macros for that day."
        />
        <Card>
          <ChartHeader
            icon={CalendarDays}
            iconClass="text-chart-3"
            title="Calories by day of week"
            description="Average intake · spot weekend indulgence"
            info="Average calories logged grouped by the day of the week. Taller weekend bars are a common pattern — eating out and relaxing routines push intake up."
          />
          <CardContent>
            <TrendChart
              data={caloriesByDay}
              xKey="day"
              height={260}
              valueFormatter={(v) => fmt.compactNumber(v)}
              series={[{ key: "kcal", label: "Avg calories", type: "bar", color: "var(--chart-3)" }]}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nutrition metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <ConfigurableTrendChart
            metrics={nutritionMetrics}
            defaultType="bar"
            height={280}
            info="Pick any logged nutrition metric to chart over the range — calories, the three macros, sugar, fibre, water and caffeine — and toggle between bar, line and area views."
          />
        </CardContent>
      </Card>

      <RecentDays metrics={logged} />
    </div>
  );
}

function NoData({ label }: { label: string }) {
  return (
    <div className="flex h-[240px] items-center justify-center text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function MacroCompositionView({ parts }: { parts: MacroPart[] }) {
  const blurb: Record<string, string> = {
    carbs: "Your body's main quick-access fuel, especially for higher-intensity activity. Quality matters — whole-food carbs over refined sugar.",
    protein: "Builds and repairs muscle and other tissue, and keeps you full. Most active people aim for a generous share here.",
    fat: "Essential for hormones, brain function and absorbing vitamins. Energy-dense at 9 kcal/g, so a little goes a long way.",
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
                {fmt.number(p.grams)} g/day
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

function EnergyIntakeChart({ data }: { data: DailyMetric[] }) {
  const [type, setType] = useState<ChartType>("bar");
  return (
    <Card className="flex flex-col lg:col-span-2">
      <ChartHeader
        icon={Flame}
        iconClass="text-chart-3"
        title="Energy intake"
        info="Total calories you logged eating each day. Only as complete as what's recorded in Apple Health via a food-tracking app. Switch between bar, line and area views."
        actions={<ChartTypeToggle value={type} onChange={setType} />}
      />
      <CardContent className="flex min-h-[320px] flex-1 flex-col">
        <TrendChart
          data={data}
          height="100%"
          valueFormatter={(v) => fmt.compactNumber(v)}
          series={[{ key: "diet_energy_kcal", label: "Calories", color: "var(--chart-3)", unit: "kcal", type }]}
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
        <CardDescription>Every day with logged nutrition in this range</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-6 py-2 font-medium">Day</th>
                <th className="px-3 py-2 text-right font-medium">Calories</th>
                <th className="px-3 py-2 text-right font-medium">Protein</th>
                <th className="px-3 py-2 text-right font-medium">Carbs</th>
                <th className="px-3 py-2 text-right font-medium">Fat</th>
                <th className="px-6 py-2 text-right font-medium">Water</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={String(d.date)} className="border-b last:border-0 hover:bg-accent/40">
                  <td className="whitespace-nowrap px-6 py-2.5 font-medium">{fmt.shortDate(d.date)}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">
                    {d.diet_energy_kcal != null ? `${fmt.number(d.diet_energy_kcal)} kcal` : "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">
                    {d.protein_g != null ? `${fmt.number(d.protein_g)} g` : "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">
                    {d.carbs_g != null ? `${fmt.number(d.carbs_g)} g` : "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">
                    {d.fat_g != null ? `${fmt.number(d.fat_g)} g` : "—"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-2.5 text-right tabular-nums">
                    {d.water_ml != null ? `${fmt.number(d.water_ml)} ml` : "—"}
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
