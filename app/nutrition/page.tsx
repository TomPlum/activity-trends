"use client";

import { useState } from "react";
import { Beef, Coffee, Croissant, Droplet, Flame, Wheat } from "lucide-react";
import { useDailyMetrics } from "@/lib/queries/metrics";
import { PageHeader } from "@/components/dashboard/page-header";
import { RangeSelect } from "@/components/dashboard/range-select";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { CardGridSkeleton, ChartSkeleton, QueryView } from "@/components/dashboard/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RangeKey } from "@/lib/queries/ranges";
import * as fmt from "@/lib/format";
import { mean } from "@/lib/stats";

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
        {(m) => (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Avg calories" value={fmt.number(mean(m.map((d) => d.diet_energy_kcal)))} unit="kcal" icon={Flame} accent="text-chart-3" spark={{ data: m, dataKey: "diet_energy_kcal", color: "var(--chart-3)" }} />
              <StatCard label="Avg protein" value={fmt.number(mean(m.map((d) => d.protein_g)))} unit="g" icon={Beef} accent="text-chart-4" spark={{ data: m, dataKey: "protein_g", color: "var(--chart-4)" }} />
              <StatCard label="Avg water" value={fmt.number(mean(m.map((d) => d.water_ml)))} unit="ml" icon={Droplet} accent="text-chart-2" spark={{ data: m, dataKey: "water_ml", color: "var(--chart-2)" }} />
              <StatCard label="Avg caffeine" value={fmt.number(mean(m.map((d) => d.caffeine_mg)))} unit="mg" icon={Coffee} accent="text-chart-5" spark={{ data: m, dataKey: "caffeine_mg", color: "var(--chart-5)" }} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Energy intake</CardTitle>
              </CardHeader>
              <CardContent>
                <TrendChart data={m} series={[{ key: "diet_energy_kcal", label: "Calories", type: "bar", color: "var(--chart-3)" }]} />
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Wheat className="h-4 w-4 text-chart-1" /> Macronutrients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TrendChart
                    data={m}
                    height={260}
                    valueFormatter={(v) => `${v.toFixed(0)}g`}
                    series={[
                      { key: "carbs_g", label: "Carbs", color: "var(--chart-1)", stackId: "m" },
                      { key: "protein_g", label: "Protein", color: "var(--chart-4)", stackId: "m" },
                      { key: "fat_g", label: "Fat", color: "var(--chart-3)", stackId: "m" },
                    ]}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Croissant className="h-4 w-4 text-chart-5" /> Sugar &amp; fibre
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TrendChart
                    data={m}
                    height={260}
                    valueFormatter={(v) => `${v.toFixed(0)}g`}
                    series={[
                      { key: "sugar_g", label: "Sugar", type: "line", color: "var(--chart-5)" },
                      { key: "fiber_g", label: "Fibre", type: "line", color: "var(--chart-1)" },
                    ]}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </QueryView>
    </>
  );
}
