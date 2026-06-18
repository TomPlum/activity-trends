"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Dumbbell,
  Filter,
  Flame,
  HeartPulse,
  MapPin,
  Route,
  Timer,
  X,
} from "lucide-react";
import { useWorkouts, useWorkoutRouteIds } from "@/lib/queries/workouts";
import { PageHeader } from "@/components/dashboard/page-header";
import { DateRangeSelect, isCustomRangeActive, type CustomRange } from "@/components/dashboard/date-range-select";
import { StatCard } from "@/components/dashboard/stat-card";
import { TablePagination } from "@/components/dashboard/table-pagination";
import {
  EMPTY_RANGE,
  isRangeActive,
  matchesRange,
  NumberRangeFilter,
  type NumberRange,
} from "@/components/dashboard/number-range-filter";
import {
  ConfigurableTrendChart,
  type ChartMetric,
} from "@/components/charts/configurable-trend-chart";
import { CardGridSkeleton, ChartSkeleton, QueryView } from "@/components/dashboard/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { deltaPct, sum } from "@/lib/stats";
import {
  CATEGORY_ACCENT,
  CATEGORY_LABELS,
  workoutMeta,
  type WorkoutCategory,
} from "@/lib/health/workout-types";
import { WorkoutIcon } from "@/components/dashboard/workout-icon";
import { cn } from "@/lib/utils";

// Each metric gets its own colour so the tiles and chart aren't a wall of green.
// `accent` is the tailwind text token for stat-card icons; `color` is the CSS
// value for sparklines and chart series.
const METRIC_COLORS = {
  sessions: { accent: "text-workout", color: "var(--workout)" },
  calories: { accent: "text-chart-3", color: "var(--chart-3)" },
  distance: { accent: "text-chart-2", color: "var(--chart-2)" },
  duration: { accent: "text-chart-5", color: "var(--chart-5)" },
  avgHr: { accent: "text-chart-4", color: "var(--chart-4)" },
} as const;

/** Trend over the range: last half vs first half of the daily series. */
function trendDelta(values: Array<number | null>): number | null {
  const window = Math.floor(values.length / 2);
  if (window < 1) return null;
  return deltaPct(values, window, sum);
}

export default function WorkoutsPage() {
  const [range, setRange] = useState<RangeKey>("90d");
  const [custom, setCustom] = useState<CustomRange | null>(null);

  // Stackable filters
  const [categories, setCategories] = useState<Set<WorkoutCategory>>(new Set());
  const [mapOnly, setMapOnly] = useState(false);
  const [duration, setDuration] = useState<NumberRange>(EMPTY_RANGE);
  const [distance, setDistance] = useState<NumberRange>(EMPTY_RANGE);
  const [calories, setCalories] = useState<NumberRange>(EMPTY_RANGE);
  const [avgHr, setAvgHr] = useState<NumberRange>(EMPTY_RANGE);

  // Pagination
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const customActive = isCustomRangeActive(custom);
  const from = customActive && custom?.from ? `${custom.from}T00:00:00` : undefined;
  const until = customActive && custom?.to ? `${custom.to}T23:59:59` : undefined;

  const query = useWorkouts({ range: customActive ? "all" : range, from, until });
  const routeIdsQuery = useWorkoutRouteIds();
  const routeIdsData = routeIdsQuery.data;
  const routeIds = useMemo(() => routeIdsData ?? new Set<string>(), [routeIdsData]);

  const toggleCategory = (c: WorkoutCategory) =>
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });

  const anyFilterActive =
    categories.size > 0 ||
    mapOnly ||
    isRangeActive(duration) ||
    isRangeActive(distance) ||
    isRangeActive(calories) ||
    isRangeActive(avgHr);

  const clearFilters = () => {
    setCategories(new Set());
    setMapOnly(false);
    setDuration(EMPTY_RANGE);
    setDistance(EMPTY_RANGE);
    setCalories(EMPTY_RANGE);
    setAvgHr(EMPTY_RANGE);
  };

  const filtered = useMemo(() => {
    let rows = query.data ?? [];
    if (categories.size)
      rows = rows.filter((w) => categories.has(workoutMeta(w.activity_type).category));
    if (mapOnly) rows = rows.filter((w) => routeIds.has(w.id));
    if (isRangeActive(duration)) rows = rows.filter((w) => matchesRange(w.duration_min, duration));
    if (isRangeActive(distance)) rows = rows.filter((w) => matchesRange(w.distance_km, distance));
    if (isRangeActive(calories)) rows = rows.filter((w) => matchesRange(w.energy_kcal, calories));
    if (isRangeActive(avgHr)) rows = rows.filter((w) => matchesRange(w.avg_heart_rate, avgHr));
    return rows;
  }, [query.data, categories, mapOnly, duration, distance, calories, avgHr, routeIds]);

  // Reset to the first page whenever the result set changes.
  const filterKey = `${range}|${customActive}|${custom?.from}|${custom?.to}|${[...categories].sort().join(",")}|${mapOnly}|${duration.min}-${duration.max}|${distance.min}-${distance.max}|${calories.min}-${calories.max}|${avgHr.min}-${avgHr.max}`;
  useEffect(() => {
    setPage(0);
  }, [filterKey]);

  // Daily aggregates power both the stat-card sparklines and the main chart.
  const daily = useMemo(() => {
    const map = new Map<
      string,
      { kcal: number; km: number; min: number; count: number; hrSum: number; hrCount: number }
    >();
    for (const w of filtered) {
      const d = w.start_time.slice(0, 10);
      const e =
        map.get(d) ?? { kcal: 0, km: 0, min: 0, count: 0, hrSum: 0, hrCount: 0 };
      e.kcal += w.energy_kcal ?? 0;
      e.km += w.distance_km ?? 0;
      e.min += w.duration_min ?? 0;
      e.count += 1;
      if (w.avg_heart_rate != null) {
        e.hrSum += w.avg_heart_rate;
        e.hrCount += 1;
      }
      map.set(d, e);
    }
    return Array.from(map.entries())
      .map(([date, v]) => ({
        date,
        calories: v.kcal,
        distance: v.km,
        duration: v.min,
        sessions: v.count,
        avgHr: v.hrCount ? v.hrSum / v.hrCount : null,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filtered]);

  // Totals + secondary stats for the tiles
  const sessions = filtered.length;
  const totalKcal = sum(filtered.map((w) => w.energy_kcal));
  const totalKm = sum(filtered.map((w) => w.distance_km));
  const totalMin = sum(filtered.map((w) => w.duration_min));
  const distanceSessions = filtered.filter((w) => w.distance_km != null && w.distance_km > 0).length;

  const chartMetrics: ChartMetric[] = useMemo(
    () => [
      {
        key: "calories",
        label: "Calories",
        icon: Flame,
        unit: "kcal",
        color: METRIC_COLORS.calories.color,
        data: daily.map((d) => ({ date: d.date, value: d.calories })),
        valueFormatter: (v) => fmt.compactNumber(v),
      },
      {
        key: "distance",
        label: "Distance",
        icon: Route,
        unit: "km",
        color: METRIC_COLORS.distance.color,
        data: daily.map((d) => ({ date: d.date, value: d.distance })),
        valueFormatter: (v) => fmt.number(v, v >= 100 ? 0 : 1),
      },
      {
        key: "duration",
        label: "Duration",
        icon: Timer,
        unit: "min",
        color: METRIC_COLORS.duration.color,
        data: daily.map((d) => ({ date: d.date, value: d.duration })),
        valueFormatter: (v) => fmt.number(v, 0),
      },
      {
        key: "sessions",
        label: "Sessions",
        icon: Dumbbell,
        color: METRIC_COLORS.sessions.color,
        data: daily.map((d) => ({ date: d.date, value: d.sessions })),
        valueFormatter: (v) => fmt.number(v, 0),
      },
      {
        key: "avgHr",
        label: "Avg heart rate",
        icon: HeartPulse,
        unit: "bpm",
        color: METRIC_COLORS.avgHr.color,
        data: daily.map((d) => ({ date: d.date, value: d.avgHr })),
        valueFormatter: (v) => fmt.number(v, 0),
      },
    ],
    [daily],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);

  return (
    <>
      <PageHeader
        title="Workouts"
        description="Every session — cardio, strength and beyond — with maps and metrics."
        actions={
          <DateRangeSelect
            range={range}
            onRangeChange={setRange}
            custom={custom}
            onCustomChange={setCustom}
          />
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
        isEmpty={(rows) => rows.length === 0}
      >
        {() => (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Sessions"
                value={fmt.number(sessions)}
                icon={Dumbbell}
                accent={METRIC_COLORS.sessions.accent}
                delta={trendDelta(daily.map((d) => d.sessions))}
                sub={`${fmt.number(daily.length)} active ${daily.length === 1 ? "day" : "days"}`}
                spark={{ data: daily, dataKey: "sessions", color: METRIC_COLORS.sessions.color }}
              />
              <StatCard
                label="Calories burned"
                value={fmt.number(totalKcal)}
                unit="kcal"
                icon={Flame}
                accent={METRIC_COLORS.calories.accent}
                delta={trendDelta(daily.map((d) => d.calories))}
                sub={sessions ? `${fmt.number(totalKcal / sessions)} avg/session` : undefined}
                spark={{ data: daily, dataKey: "calories", color: METRIC_COLORS.calories.color }}
              />
              <StatCard
                label="Total distance"
                value={fmt.number(totalKm)}
                unit="km"
                icon={Route}
                accent={METRIC_COLORS.distance.accent}
                delta={trendDelta(daily.map((d) => d.distance))}
                sub={
                  distanceSessions
                    ? `${fmt.distanceKm(totalKm / distanceSessions)} avg`
                    : "no distance logged"
                }
                spark={{ data: daily, dataKey: "distance", color: METRIC_COLORS.distance.color }}
              />
              <StatCard
                label="Time"
                value={fmt.duration(totalMin)}
                icon={Timer}
                accent={METRIC_COLORS.duration.accent}
                delta={trendDelta(daily.map((d) => d.duration))}
                sub={sessions ? `${fmt.duration(totalMin / sessions)} avg/session` : undefined}
                spark={{ data: daily, dataKey: "duration", color: METRIC_COLORS.duration.color }}
              />
            </div>

            <ConfigurableTrendChart
              title="Trends over time"
              metrics={chartMetrics}
              defaultMetric="calories"
              defaultType="bar"
            />

            <Card>
              <CardHeader className="gap-3">
                <CardTitle className="text-base">Sessions</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn("gap-1.5", categories.size > 0 && "border-workout text-workout")}
                      >
                        <Filter className="h-3.5 w-3.5" /> Type
                        {categories.size > 0 && (
                          <Badge variant="secondary" className="ml-0.5 h-4 px-1 text-[10px]">
                            {categories.size}
                          </Badge>
                        )}
                        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-44">
                      <DropdownMenuLabel>Activity type</DropdownMenuLabel>
                      {(Object.keys(CATEGORY_LABELS) as WorkoutCategory[]).map((c) => (
                        <DropdownMenuCheckboxItem
                          key={c}
                          checked={categories.has(c)}
                          onCheckedChange={() => toggleCategory(c)}
                          onSelect={(e) => e.preventDefault()}
                        >
                          {CATEGORY_LABELS[c]}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <NumberRangeFilter label="Duration" unit="min" value={duration} onChange={setDuration} />
                  <NumberRangeFilter label="Distance" unit="km" value={distance} onChange={setDistance} />
                  <NumberRangeFilter label="Calories" unit="kcal" value={calories} onChange={setCalories} />
                  <NumberRangeFilter label="Avg HR" unit="bpm" value={avgHr} onChange={setAvgHr} />

                  <Button
                    variant="outline"
                    size="sm"
                    className={cn("gap-1.5", mapOnly && "border-workout bg-workout/10 text-workout")}
                    onClick={() => setMapOnly((v) => !v)}
                  >
                    <MapPin className="h-3.5 w-3.5" /> Has map
                  </Button>

                  {anyFilterActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-muted-foreground"
                      onClick={clearFilters}
                    >
                      <X className="h-3.5 w-3.5" /> Clear
                    </Button>
                  )}
                </div>
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
                    {pageRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                          No sessions match the current filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      pageRows.map((w) => {
                        const meta = workoutMeta(w.activity_type);
                        const hasMap = routeIds.has(w.id);
                        return (
                          <TableRow key={w.id} className="cursor-pointer">
                            <TableCell className="pl-6">
                              <Link
                                href={`/workouts/${w.id}`}
                                className="flex items-center gap-2.5 font-medium hover:underline"
                              >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                                  <WorkoutIcon
                                    name={meta.icon}
                                    className={cn("h-4 w-4", CATEGORY_ACCENT[meta.category])}
                                  />
                                </span>
                                {meta.label}
                                <Badge variant="secondary" className="text-[10px]">
                                  {CATEGORY_LABELS[meta.category]}
                                </Badge>
                                {hasMap && (
                                  <span title="Route map available" className="inline-flex">
                                    <MapPin className="h-3.5 w-3.5 text-workout" aria-label="Route map available" />
                                  </span>
                                )}
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
                      })
                    )}
                  </TableBody>
                </Table>
                <TablePagination
                  page={safePage}
                  pageSize={pageSize}
                  total={filtered.length}
                  onPageChange={setPage}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setPage(0);
                  }}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </QueryView>
    </>
  );
}
