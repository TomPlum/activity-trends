"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Dumbbell, Flame, Route, Timer } from "lucide-react";
import { useWorkouts } from "@/lib/queries/workouts";
import { PageHeader } from "@/components/dashboard/page-header";
import { RangeSelect } from "@/components/dashboard/range-select";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { CardGridSkeleton, ChartSkeleton, QueryView } from "@/components/dashboard/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RangeKey } from "@/lib/queries/ranges";
import * as fmt from "@/lib/format";
import { sum } from "@/lib/stats";
import {
  CATEGORY_LABELS,
  workoutMeta,
  type WorkoutCategory,
} from "@/lib/health/workout-types";

type CategoryFilter = WorkoutCategory | "all";

export default function WorkoutsPage() {
  const [range, setRange] = useState<RangeKey>("90d");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const query = useWorkouts({ range });

  const filtered = useMemo(() => {
    const rows = query.data ?? [];
    if (category === "all") return rows;
    return rows.filter((w) => workoutMeta(w.activity_type).category === category);
  }, [query.data, category]);

  const caloriesByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const w of filtered) {
      const d = w.start_time.slice(0, 10);
      map.set(d, (map.get(d) ?? 0) + (w.energy_kcal ?? 0));
    }
    return Array.from(map.entries())
      .map(([date, kcal]) => ({ date, kcal }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filtered]);

  return (
    <>
      <PageHeader
        title="Workouts"
        description="Every session — cardio, strength and beyond — with maps and metrics."
        actions={
          <div className="flex items-center gap-2">
            <Select value={category} onValueChange={(v) => setCategory(v as CategoryFilter)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {(Object.keys(CATEGORY_LABELS) as WorkoutCategory[]).map((c) => (
                  <SelectItem key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <RangeSelect value={range} onChange={setRange} />
          </div>
        }
      />

      <QueryView
        query={query}
        loading={
          <div className="space-y-6">
            <CardGridSkeleton />
            <ChartSkeleton />
          </div>
        }
        isEmpty={() => filtered.length === 0}
      >
        {() => (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Sessions" value={fmt.number(filtered.length)} icon={Dumbbell} accent="text-chart-3" />
              <StatCard label="Calories burned" value={fmt.number(sum(filtered.map((w) => w.energy_kcal)))} unit="kcal" icon={Flame} accent="text-chart-4" />
              <StatCard label="Total distance" value={fmt.number(sum(filtered.map((w) => w.distance_km)))} unit="km" icon={Route} accent="text-chart-2" />
              <StatCard label="Time" value={fmt.duration(sum(filtered.map((w) => w.duration_min)))} icon={Timer} accent="text-chart-1" />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Calories burned</CardTitle>
              </CardHeader>
              <CardContent>
                <TrendChart data={caloriesByDay} series={[{ key: "kcal", label: "Calories", type: "bar", color: "var(--chart-3)" }]} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sessions</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Duration</TableHead>
                      <TableHead className="text-right">Distance</TableHead>
                      <TableHead className="text-right">Calories</TableHead>
                      <TableHead className="text-right">Avg HR</TableHead>
                      <TableHead className="pr-6 text-right">Pace</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.slice(0, 100).map((w) => {
                      const meta = workoutMeta(w.activity_type);
                      return (
                        <TableRow key={w.id} className="cursor-pointer">
                          <TableCell className="pl-6">
                            <Link href={`/workouts/${w.id}`} className="flex items-center gap-2 font-medium hover:underline">
                              {meta.label}
                              <Badge variant="secondary" className="text-[10px]">
                                {CATEGORY_LABELS[meta.category]}
                              </Badge>
                            </Link>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{fmt.shortDate(w.start_time)}</TableCell>
                          <TableCell className="text-right tabular-nums">{fmt.duration(w.duration_min)}</TableCell>
                          <TableCell className="text-right tabular-nums">{w.distance_km ? fmt.distanceKm(w.distance_km) : "—"}</TableCell>
                          <TableCell className="text-right tabular-nums">{fmt.number(w.energy_kcal)}</TableCell>
                          <TableCell className="text-right tabular-nums">{w.avg_heart_rate ? fmt.number(w.avg_heart_rate) : "—"}</TableCell>
                          <TableCell className="pr-6 text-right tabular-nums">{fmt.pace(w.distance_km, w.duration_min)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </QueryView>
    </>
  );
}
