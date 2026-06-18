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

// Semi-transparent lines so overlapping routes build up into a heat-like glow.
const glowLayer: LayerProps = {
  id: "routes-glow",
  type: "line",
  layout: { "line-cap": "round", "line-join": "round" },
  paint: { "line-color": "#f97316", "line-width": 5, "line-opacity": 0.08, "line-blur": 3 },
};
const lineLayer: LayerProps = {
  id: "routes-line",
  type: "line",
  layout: { "line-cap": "round", "line-join": "round" },
  paint: { "line-color": "#fb923c", "line-width": 1.6, "line-opacity": 0.5 },
};

export interface MapRoute {
  points: [number, number][];
}

const MAX_POINTS_PER_ROUTE = 120;

export default function AllRoutesMap({
  routes,
  height = 560,
}: {
  routes: MapRoute[];
  height?: number;
}) {
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
        className="flex items-center justify-center rounded-xl border text-sm text-muted-foreground"
        style={{ height }}
      >
        No routes match this filter.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border" style={{ height }}>
      <Map
        key={geojson.features.length}
        initialViewState={initialViewState}
        mapStyle={OSM_STYLE}
        style={{ width: "100%", height: "100%" }}
      >
        <Source id="all-routes" type="geojson" data={geojson}>
          <Layer {...glowLayer} />
          <Layer {...lineLayer} />
        </Source>
      </Map>
    </div>
  );
}
