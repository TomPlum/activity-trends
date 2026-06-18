"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import Map, { Layer, Source, type LayerProps } from "react-map-gl/maplibre";
import { basemapFor, routeColorsFor } from "@/lib/map/basemap";

export interface RouteMapProps {
  /** Ordered [lng, lat] pairs. */
  points: [number, number][];
  bounds?: [number, number, number, number] | null; // [w, s, e, n]
  height?: number;
}

export default function RouteMap({ points, bounds, height = 360 }: RouteMapProps) {
  const { resolvedTheme } = useTheme();
  const mapStyle = useMemo(() => basemapFor(resolvedTheme), [resolvedTheme]);
  const lineLayer = useMemo<LayerProps>(
    () => ({
      id: "route-line",
      type: "line",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": routeColorsFor(resolvedTheme).single,
        "line-width": 4,
        "line-opacity": 0.9,
      },
    }),
    [resolvedTheme],
  );

  const geojson = useMemo(
    () => ({
      type: "Feature" as const,
      properties: {},
      geometry: { type: "LineString" as const, coordinates: points },
    }),
    [points],
  );

  const initialViewState = useMemo(() => {
    if (bounds) {
      return {
        bounds: bounds as [number, number, number, number],
        fitBoundsOptions: { padding: 40 },
      };
    }
    const mid = points[Math.floor(points.length / 2)] ?? [0, 0];
    return { longitude: mid[0], latitude: mid[1], zoom: 13 };
  }, [bounds, points]);

  if (!points.length) return null;

  return (
    <div className="overflow-hidden rounded-xl border" style={{ height }}>
      <Map
        initialViewState={initialViewState}
        mapStyle={mapStyle}
        style={{ width: "100%", height: "100%" }}
      >
        <Source id="route" type="geojson" data={geojson}>
          <Layer {...lineLayer} />
        </Source>
      </Map>
    </div>
  );
}
