"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { Route as RouteIcon, Flame, Palette, Sparkles, Trophy } from "lucide-react";
import { useAllRoutes } from "@/lib/queries/all-routes";
import { workoutMeta } from "@/lib/health/workout-types";
import { PageHeader } from "@/components/dashboard/page-header";
import { InfoHint } from "@/components/dashboard/info-hint";
import { QueryView } from "@/components/dashboard/states";
import { useActiveAreas, haversineKm, type ActiveArea } from "@/lib/map/areas";
import type { MapFocus, MapRoute, RouteColorMode } from "@/components/dashboard/all-routes-map";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import * as fmt from "@/lib/format";

const AllRoutesMap = dynamic(() => import("@/components/dashboard/all-routes-map"), {
  ssr: false,
  loading: () => <Skeleton className="min-h-0 w-full flex-1 rounded-xl" />,
});

interface MergedRoute extends MapRoute {
  year: number;
}

function boundsOf(points: [number, number][]): [number, number, number, number] {
  let w = Infinity;
  let s = Infinity;
  let e = -Infinity;
  let n = -Infinity;
  for (const [lng, lat] of points) {
    if (lng < w) w = lng;
    if (lat < s) s = lat;
    if (lng > e) e = lng;
    if (lat > n) n = lat;
  }
  return [w, s, e, n];
}

export default function MapPage() {
  const query = useAllRoutes();
  const data = query.data;

  const [sport, setSport] = useState("all");
  const [year, setYear] = useState("all");
  const [colorMode, setColorMode] = useState<RouteColorMode>("heat");
  const [focus, setFocus] = useState<MapFocus | null>(null);

  const focusOn = useCallback((bounds: [number, number, number, number]) => {
    setFocus({ bounds, nonce: Date.now() });
  }, []);

  const merged = useMemo<MergedRoute[]>(() => {
    if (!data) return [];
    const metaById = new Map(data.workouts.map((w) => [w.id, w]));
    return data.routes
      .map((r) => {
        const pts = (r.points as [number, number][] | null) ?? [];
        if (pts.length < 2) return null;
        const w = r.workout_id ? metaById.get(r.workout_id) : undefined;
        return {
          points: pts,
          activityType: w?.activity_type ?? "Other",
          distanceKm: r.distance_km ?? 0,
          date: w?.start_time ?? null,
          year: w?.start_time ? new Date(w.start_time).getFullYear() : 0,
        };
      })
      .filter((r): r is MergedRoute => r != null);
  }, [data]);

  const sports = useMemo(
    () => Array.from(new Set(merged.map((r) => r.activityType))).sort(),
    [merged],
  );
  const years = useMemo(
    () => Array.from(new Set(merged.map((r) => r.year).filter(Boolean))).sort((a, b) => b - a),
    [merged],
  );

  const filtered = useMemo(
    () =>
      merged.filter(
        (r) =>
          (sport === "all" || r.activityType === sport) &&
          (year === "all" || r.year === Number(year)),
      ),
    [merged, sport, year],
  );

  const areas = useActiveAreas(filtered);

  const totalDistance = useMemo(() => filtered.reduce((s, r) => s + r.distanceKm, 0), [filtered]);

  // Exploration stats derived from the detected areas.
  const countries = useMemo(
    () => new Set(areas.map((a) => a.country).filter(Boolean)).size,
    [areas],
  );
  const furthestKm = useMemo(() => {
    const home = areas[0];
    if (!home || areas.length < 2) return 0;
    return Math.max(...areas.map((a) => haversineKm(home.center, a.center)));
  }, [areas]);

  // First time each named area appeared, oldest first.
  const newGround = useMemo(
    () =>
      areas
        .filter((a) => a.name && a.firstDate)
        .sort((a, b) => (a.firstDate! < b.firstDate! ? -1 : 1)),
    [areas],
  );

  const longestRoute = useMemo(
    () => filtered.reduce<MergedRoute | null>((best, r) => (!best || r.distanceKm > best.distanceKm ? r : best), null),
    [filtered],
  );

  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col lg:h-[calc(100dvh-4rem)]">
      <PageHeader
        title="Routes Map"
        description="Every outdoor workout you've recorded, overlaid into a single map of your training ground."
      />

      <QueryView
        query={query}
        loading={<Skeleton className="min-h-0 w-full flex-1 rounded-xl" />}
        isEmpty={(d) => d.routes.length === 0}
      >
        {() => (
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                <Stat label="Routes" value={fmt.number(filtered.length)} />
                <Stat label="Distance" value={`${fmt.number(totalDistance)} km`} />
                <Stat label="Sports" value={fmt.number(sports.length)} />
                <Stat label="Areas" value={fmt.number(areas.length)} />
                <Stat label="Countries" value={countries ? fmt.number(countries) : "—"} />
                <Stat
                  label="Furthest apart"
                  value={furthestKm ? `${fmt.number(furthestKm)} km` : "—"}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ColorModeToggle value={colorMode} onChange={setColorMode} />
                <Select value={sport} onValueChange={setSport}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sports</SelectItem>
                    {sports.map((s) => (
                      <SelectItem key={s} value={s}>
                        {workoutMeta(s).label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All years</SelectItem>
                    {years.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <InfoHint text="Every outdoor workout with GPS, overlaid on one map. In heat mode brighter areas are where your routes overlap most; in by-sport mode each activity gets its own colour. Filter by sport and year, and use the on-map buttons to jump to new areas or your longest route." />
              </div>
            </div>

            <Card className="min-h-0 flex-1 overflow-hidden py-0">
              <CardContent className="relative h-full p-0">
                <AllRoutesMap
                  routes={filtered}
                  areas={areas}
                  colorMode={colorMode}
                  focus={focus}
                  fill
                />
                <div className="pointer-events-none absolute right-3 top-3 flex flex-col items-end gap-2">
                  {newGround.length > 1 && (
                    <NewGroundButton areas={newGround} onFocus={focusOn} />
                  )}
                  {longestRoute && (
                    <BiggestAdventureButton route={longestRoute} onFocus={focusOn} />
                  )}
                </div>
              </CardContent>
            </Card>

            <p className="flex shrink-0 items-center gap-1.5 px-1 text-xs text-muted-foreground">
              <RouteIcon className="h-3.5 w-3.5" />
              {colorMode === "heat"
                ? "Brighter areas are where your routes overlap most. Lines are simplified for performance."
                : "Routes are coloured by sport. Lines are simplified for performance."}
            </p>
          </div>
        )}
      </QueryView>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function ColorModeToggle({
  value,
  onChange,
}: {
  value: RouteColorMode;
  onChange: (mode: RouteColorMode) => void;
}) {
  const opt = (mode: RouteColorMode, icon: React.ReactNode, label: string) => (
    <button
      type="button"
      onClick={() => onChange(mode)}
      className={cn(
        "flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors",
        value === mode ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
  return (
    <div className="inline-flex rounded-md border p-0.5">
      {opt("heat", <Flame className="h-3.5 w-3.5" />, "Heat")}
      {opt("sport", <Palette className="h-3.5 w-3.5" />, "By sport")}
    </div>
  );
}

function NewGroundButton({
  areas,
  onFocus,
}: {
  areas: ActiveArea[];
  onFocus: (bounds: [number, number, number, number]) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="sm" className="pointer-events-auto shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          New ground
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-2">
        <p className="px-1 pb-1.5 text-xs font-medium text-muted-foreground">
          First time you explored each area
        </p>
        <div className="max-h-72 space-y-0.5 overflow-y-auto">
          {areas.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => onFocus(a.bounds)}
              className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent"
            >
              <span className="truncate">{a.name}</span>
              <span className="shrink-0 tabular-nums text-xs text-muted-foreground">
                {fmt.shortDate(a.firstDate!)}
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function BiggestAdventureButton({
  route,
  onFocus,
}: {
  route: MapRoute;
  onFocus: (bounds: [number, number, number, number]) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="pointer-events-auto shadow-sm"
          onClick={() => onFocus(boundsOf(route.points))}
        >
          <Trophy className="h-3.5 w-3.5" />
          Biggest adventure
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 space-y-1.5">
        <p className="text-2xl font-semibold tabular-nums">{fmt.distanceKm(route.distanceKm, 1)}</p>
        <p className="text-sm text-muted-foreground">
          {workoutMeta(route.activityType).label}
          {route.date ? ` · ${fmt.shortDate(route.date)}` : ""}
        </p>
        <p className="text-xs text-muted-foreground">
          Your longest single route — click the button again to frame it on the map.
        </p>
      </PopoverContent>
    </Popover>
  );
}
