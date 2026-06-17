"use client";

import { useMemo } from "react";
import Map, { Layer, Source, type LayerProps } from "react-map-gl/maplibre";
import type { StyleSpecification } from "maplibre-gl";

// Free OpenStreetMap raster tiles — no API key, no billing.
const OSM_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

const lineLayer: LayerProps = {
  id: "route-line",
  type: "line",
  layout: { "line-cap": "round", "line-join": "round" },
  paint: {
    "line-color": "#22c55e",
    "line-width": 4,
    "line-opacity": 0.9,
  },
};

export interface RouteMapProps {
  /** Ordered [lng, lat] pairs. */
  points: [number, number][];
  bounds?: [number, number, number, number] | null; // [w, s, e, n]
  height?: number;
}

export default function RouteMap({ points, bounds, height = 360 }: RouteMapProps) {
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
        mapStyle={OSM_STYLE}
        style={{ width: "100%", height: "100%" }}
      >
        <Source id="route" type="geojson" data={geojson}>
          <Layer {...lineLayer} />
        </Source>
      </Map>
    </div>
  );
}
