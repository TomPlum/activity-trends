"use client";

import { useMemo, useRef } from "react";
import { useTheme } from "next-themes";
import Map, { Layer, Source, type LayerProps, type MapRef } from "react-map-gl/maplibre";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { basemapFor, routeColorsFor } from "@/lib/map/basemap";
import { useActiveAreas } from "@/lib/map/areas";

export interface MapRoute {
  points: [number, number][];
}

const MAX_POINTS_PER_ROUTE = 120;

export default function AllRoutesMap({
  routes,
  height = 560,
  fill = false,
}: {
  routes: MapRoute[];
  height?: number;
  /** Stretch to fill the parent's height instead of using `height` px. */
  fill?: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const mapRef = useRef<MapRef>(null);
  const areas = useActiveAreas(routes);

  const mapStyle = useMemo(() => basemapFor(resolvedTheme), [resolvedTheme]);

  const { glowLayer, lineLayer } = useMemo(() => {
    const colors = routeColorsFor(resolvedTheme);
    return {
      // Semi-transparent lines so overlapping routes build into a heat-like glow.
      glowLayer: {
        id: "routes-glow",
        type: "line",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": colors.glow,
          "line-width": 5,
          "line-opacity": 0.1,
          "line-blur": 3,
        },
      } satisfies LayerProps,
      lineLayer: {
        id: "routes-line",
        type: "line",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": colors.line, "line-width": 1.6, "line-opacity": 0.6 },
      } satisfies LayerProps,
    };
  }, [resolvedTheme]);

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
          properties: {},
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
              {areas.map((area) => (
                <button
                  key={area.id}
                  type="button"
                  onClick={() =>
                    mapRef.current?.fitBounds(area.bounds, {
                      padding: 60,
                      duration: 1200,
                      maxZoom: 14,
                    })
                  }
                  className="rounded-full border bg-card px-2.5 py-1 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  title={`${area.routeCount} route${area.routeCount === 1 ? "" : "s"}`}
                >
                  {area.name ?? "Locating…"}
                  <span className="ml-1 tabular-nums text-muted-foreground">
                    {area.routeCount}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
