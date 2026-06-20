"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, Flame, MapPin, Route, Thermometer, Timer } from "lucide-react";
import { useWorkout, useWorkoutRoute } from "@/lib/queries/workouts";
import { PageHeader } from "@/components/dashboard/page-header";
import { ChartHeader } from "@/components/dashboard/chart-header";
import { ChartSkeleton, ErrorState } from "@/components/dashboard/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import * as fmt from "@/lib/format";
import { CATEGORY_LABELS, workoutMeta } from "@/lib/health/workout-types";

// MapLibre touches `window`, so load the map only on the client.
const RouteMap = dynamic(() => import("@/components/dashboard/route-map"), {
  ssr: false,
  loading: () => <ChartSkeleton className="h-[360px]" />,
});

export default function WorkoutDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const workout = useWorkout(id);
  const route = useWorkoutRoute(id);

  if (workout.isError) return <ErrorState error={workout.error} />;

  const w = workout.data;
  const meta = w ? workoutMeta(w.activity_type) : null;
  const points = (route.data?.points as [number, number][] | undefined) ?? [];
  const bounds = (route.data?.bounds as [number, number, number, number] | null | undefined) ?? null;

  return (
    <>
      <Link
        href="/workouts"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to workouts
      </Link>

      {workout.isPending || !w || !meta ? (
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <ChartSkeleton className="h-[360px]" />
        </div>
      ) : (
        <>
          <PageHeader
            title={meta.label}
            description={`${fmt.shortDate(w.start_time)} · ${fmt.timeOfDay(w.start_time)}`}
            actions={<Badge variant="secondary">{CATEGORY_LABELS[meta.category]}</Badge>}
          />

          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric icon={Timer} label="Duration" value={fmt.duration(w.duration_min)} accent="text-chart-1" />
            <Metric icon={Flame} label="Calories" value={`${fmt.number(w.energy_kcal)} kcal`} accent="text-chart-4" />
            <Metric icon={Route} label="Distance" value={w.distance_km ? fmt.distanceKm(w.distance_km) : "—"} accent="text-chart-2" />
            <Metric icon={MapPin} label="Pace" value={fmt.pace(w.distance_km, w.duration_min)} accent="text-chart-3" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <ChartHeader
                title="Route"
                info="The GPS track recorded for this workout, drawn on a map. Only outdoor sessions with location data have a route; indoor workouts won't show one."
              />
              <CardContent>
                {route.isPending ? (
                  <ChartSkeleton className="h-[360px]" />
                ) : points.length > 0 ? (
                  <RouteMap points={points} bounds={bounds} />
                ) : (
                  <div className="flex h-[360px] items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
                    No GPS route recorded for this workout.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Detail label="Started" value={`${fmt.shortDate(w.start_time)} ${fmt.timeOfDay(w.start_time)}`} />
                {w.end_time && <Detail label="Ended" value={fmt.timeOfDay(w.end_time)} />}
                <Detail label="Avg heart rate" value={w.avg_heart_rate ? `${fmt.number(w.avg_heart_rate)} bpm` : "—"} />
                <Detail label="Max heart rate" value={w.max_heart_rate ? `${fmt.number(w.max_heart_rate)} bpm` : "—"} />
                {w.temperature_c != null && (
                  <Detail
                    label="Weather"
                    value={`${fmt.number(w.temperature_c, 1)}°C${w.humidity != null ? ` · ${fmt.number(w.humidity)}% RH` : ""}`}
                    icon={<Thermometer className="h-3.5 w-3.5 text-muted-foreground" />}
                  />
                )}
                {w.timezone && <Detail label="Timezone" value={w.timezone} />}
                <Detail label="Source" value={w.source ?? "—"} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Timer;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Icon className={`h-4 w-4 ${accent}`} /> {label}
        </div>
        <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

function Detail({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1.5 font-medium">
        {icon}
        {value}
      </span>
    </div>
  );
}
