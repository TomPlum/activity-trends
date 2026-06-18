"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Route as RouteIcon } from "lucide-react";
import { useAllRoutes } from "@/lib/queries/all-routes";
import { workoutMeta } from "@/lib/health/workout-types";
import { PageHeader } from "@/components/dashboard/page-header";
import { QueryView } from "@/components/dashboard/states";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as fmt from "@/lib/format";

const AllRoutesMap = dynamic(() => import("@/components/dashboard/all-routes-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-[560px] w-full rounded-xl" />,
});

interface MergedRoute {
  points: [number, number][];
  activityType: string;
  year: number;
  distanceKm: number;
}

export default function MapPage() {
  const query = useAllRoutes();
  const [sport, setSport] = useState("all");
  const [year, setYear] = useState("all");

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
        {(data) => {
          const metaById = new Map(data.workouts.map((w) => [w.id, w]));

          const merged: MergedRoute[] = data.routes
            .map((r) => {
              const pts = (r.points as [number, number][] | null) ?? [];
              if (pts.length < 2) return null;
              const w = r.workout_id ? metaById.get(r.workout_id) : undefined;
              return {
                points: pts,
                activityType: w?.activity_type ?? "Other",
                year: w?.start_time ? new Date(w.start_time).getFullYear() : 0,
                distanceKm: r.distance_km ?? 0,
              };
            })
            .filter((r): r is MergedRoute => r != null);

          const sports = Array.from(new Set(merged.map((r) => r.activityType))).sort();
          const years = Array.from(new Set(merged.map((r) => r.year).filter(Boolean))).sort(
            (a, b) => b - a,
          );

          const filtered = merged.filter(
            (r) =>
              (sport === "all" || r.activityType === sport) &&
              (year === "all" || r.year === Number(year)),
          );

          const totalDistance = filtered.reduce((s, r) => s + r.distanceKm, 0);

          return (
            <div className="flex min-h-0 flex-1 flex-col gap-4">
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-4">
                  <Stat label="Routes" value={fmt.number(filtered.length)} />
                  <Stat label="Distance" value={`${fmt.number(totalDistance)} km`} />
                  <Stat label="Sports" value={fmt.number(sports.length)} />
                </div>
                <div className="flex items-center gap-2">
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
                </div>
              </div>

              <Card className="min-h-0 flex-1 overflow-hidden py-0">
                <CardContent className="h-full p-0">
                  <AllRoutesMap routes={filtered} fill />
                </CardContent>
              </Card>

              <p className="flex shrink-0 items-center gap-1.5 px-1 text-xs text-muted-foreground">
                <RouteIcon className="h-3.5 w-3.5" />
                Brighter areas are where your routes overlap most. Lines are simplified for
                performance.
              </p>
            </div>
          );
        }}
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
