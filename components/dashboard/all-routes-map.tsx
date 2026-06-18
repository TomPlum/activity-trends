"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useTheme } from "next-themes";
import Map, { Layer, Source, type LayerProps, type MapRef } from "react-map-gl/maplibre";
import { MapPin, CalendarDays, Route as RouteIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import * as fmt from "@/lib/format";
import { workoutMeta } from "@/lib/health/workout-types";
import { basemapFor, routeColorsFor } from "@/lib/map/basemap";
import { sportColor } from "@/lib/map/sports";
import type { ActiveArea } from "@/lib/map/areas";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface MapRoute {
  points: [number, number][];
  activityType: string;
  distanceKm: number;
  date: string | null;
}

export type RouteColorMode = "heat" | "sport";

export interface MapFocus {
  bounds: [number, number, number, number];
  /** Bump to re-trigger a fly-to even if the bounds are unchanged. */
  nonce: number;
}

const MAX_POINTS_PER_ROUTE = 120;

export default function AllRoutesMap({
  routes,
  areas,
  colorMode = "heat",
  focus = null,
  height = 560,
  fill = false,
}: {
  routes: MapRoute[];
  areas: ActiveArea[];
  colorMode?: RouteColorMode;
  focus?: MapFocus | null;
  height?: number;
  /** Stretch to fill the parent's height instead of using `height` px. */
  fill?: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const mapRef = useRef<MapRef>(null);

  const mapStyle = useMemo(() => basemapFor(resolvedTheme), [resolvedTheme]);

  const flyTo = useCallback((bounds: [number, number, number, number]) => {
    mapRef.current?.fitBounds(bounds, { padding: 60, duration: 1200, maxZoom: 14 });
  }, []);

  // Fly when the page requests a focus (timeline / biggest-adventure links).
  const lastNonce = useRef<number | null>(null);
  useEffect(() => {
    if (focus && focus.nonce !== lastNonce.current) {
      lastNonce.current = focus.nonce;
      flyTo(focus.bounds);
    }
  }, [focus, flyTo]);

  const { glowLayer, lineLayer } = useMemo(() => {
    const layout = { "line-cap": "round", "line-join": "round" } as const;
    if (colorMode === "sport") {
      return {
        glowLayer: {
          id: "routes-glow",
          type: "line",
          layout,
          paint: {
            "line-color": ["get", "color"],
            "line-width": 5,
            "line-opacity": 0.12,
            "line-blur": 3,
          },
        } satisfies LayerProps,
        lineLayer: {
          id: "routes-line",
          type: "line",
          layout,
          paint: { "line-color": ["get", "color"], "line-width": 2, "line-opacity": 0.85 },
        } satisfies LayerProps,
      };
    }
    const colors = routeColorsFor(resolvedTheme);
    return {
      // Semi-transparent lines so overlapping routes build into a heat-like glow.
      glowLayer: {
        id: "routes-glow",
        type: "line",
        layout,
        paint: { "line-color": colors.glow, "line-width": 5, "line-opacity": 0.1, "line-blur": 3 },
      } satisfies LayerProps,
      lineLayer: {
        id: "routes-line",
        type: "line",
        layout,
        paint: { "line-color": colors.line, "line-width": 1.6, "line-opacity": 0.6 },
      } satisfies LayerProps,
    };
  }, [colorMode, resolvedTheme]);

  const { geojson, bounds } = useMemo(() => {
    let minLng = Infinity;
    let minLat = Infinity;
    let maxLng = -Infinity;
    let maxLat = -Infinity;

    const features = routes
      .map((route) => {
        const pts = route.points;
        if (!Array.isArray(pts) || pts.length < 2) return null;
        const stride = Math.max(1, Math.ceil(pts.length / MAX_POINTS_PER_ROUTE));
        const coords: [number, number][] = [];
        for (let i = 0; i < pts.length; i += stride) {
          const [lng, lat] = pts[i];
          if (lng < minLng) minLng = lng;
          if (lat < minLat) minLat = lat;
          if (lng > maxLng) maxLng = lng;
          if (lat > maxLat) maxLat = lat;
          coords.push([lng, lat]);
        }
        // ensure the final point is kept so lines close visually
        const last = pts[pts.length - 1];
        coords.push([last[0], last[1]]);
        return {
          type: "Feature" as const,
          properties: { color: sportColor(route.activityType) },
          geometry: { type: "LineString" as const, coordinates: coords },
        };
      })
      .filter((f): f is NonNullable<typeof f> => f != null);

    const validBounds =
      Number.isFinite(minLng) && Number.isFinite(minLat)
        ? ([minLng, minLat, maxLng, maxLat] as [number, number, number, number])
        : null;

    return {
      geojson: { type: "FeatureCollection" as const, features },
      bounds: validBounds,
    };
  }, [routes]);

  const legend = useMemo(() => {
    const seen = new Set<string>();
    const out: { activityType: string; color: string }[] = [];
    for (const r of routes) {
      if (seen.has(r.activityType)) continue;
      seen.add(r.activityType);
      out.push({ activityType: r.activityType, color: sportColor(r.activityType) });
    }
    return out;
  }, [routes]);

  const initialViewState = useMemo(() => {
    if (bounds) return { bounds, fitBoundsOptions: { padding: 48 } };
    return { longitude: 0, latitude: 51.5, zoom: 9 };
  }, [bounds]);

  if (!geojson.features.length) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl border text-sm text-muted-foreground",
          fill && "h-full",
        )}
        style={fill ? undefined : { height }}
      >
        No routes match this filter.
      </div>
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden rounded-xl border", fill && "h-full")}
      style={fill ? undefined : { height }}
    >
      <Map
        ref={mapRef}
        key={geojson.features.length}
        initialViewState={initialViewState}
        mapStyle={mapStyle}
        style={{ width: "100%", height: "100%" }}
      >
        <Source id="all-routes" type="geojson" data={geojson}>
          <Layer {...glowLayer} />
          <Layer {...lineLayer} />
        </Source>
      </Map>

      {areas.length > 1 && (
        <div className="pointer-events-none absolute left-3 top-3 max-w-[calc(100%-1.5rem)]">
          <div className="pointer-events-auto rounded-lg border bg-background/85 p-2 shadow-sm backdrop-blur">
            <p className="mb-1.5 flex items-center gap-1.5 px-1 text-[11px] font-medium text-muted-foreground">
              <MapPin className="h-3 w-3" />
              Active areas
            </p>
            <div className="flex max-w-xs flex-wrap gap-1.5">
              {areas.slice(0, 8).map((area) => (
                <Popover key={area.id}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      onClick={() => flyTo(area.bounds)}
                      className="rounded-full border bg-card px-2.5 py-1 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {area.name ?? "Locating…"}
                      <span className="ml-1 tabular-nums text-muted-foreground">
                        {area.routeCount}
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-60">
                    <AreaDetail area={area} />
                  </PopoverContent>
                </Popover>
              ))}
            </div>
          </div>
        </div>
      )}

      {colorMode === "sport" && legend.length > 0 && (
        <div className="pointer-events-none absolute bottom-3 left-3">
          <div className="pointer-events-auto flex flex-col gap-1 rounded-lg border bg-background/85 p-2 text-[11px] shadow-sm backdrop-blur">
            {legend.map(({ activityType, color }) => (
              <span key={activityType} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {workoutMeta(activityType).label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AreaDetail({ area }: { area: ActiveArea }) {
  return (
    <div className="space-y-2 text-sm">
      <div>
        <p className="font-semibold leading-tight">{area.name ?? "Locating…"}</p>
        {area.country && <p className="text-xs text-muted-foreground">{area.country}</p>}
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <RouteIcon className="h-3.5 w-3.5" />
        {fmt.number(area.routeCount)} routes · {fmt.distanceKm(area.totalDistanceKm, 0)}
      </div>
      {(area.firstDate || area.lastDate) && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          {area.firstDate ? fmt.shortDate(area.firstDate) : "—"}
          {area.lastDate && area.lastDate !== area.firstDate
            ? ` – ${fmt.shortDate(area.lastDate)}`
            : ""}
        </div>
      )}
      <div className="flex flex-wrap gap-1 pt-0.5">
        {area.sports.map((s) => (
          <span
            key={s.activityType}
            className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: sportColor(s.activityType) }}
            />
            {workoutMeta(s.activityType).label}
            <span className="tabular-nums text-muted-foreground">{s.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
