"use client";

import { useEffect, useMemo, useState } from "react";

export interface AreaRoute {
  points: [number, number][];
}

export interface ActiveArea {
  id: string;
  /** [lng, lat] centroid used for fly-to framing and geocoding. */
  center: [number, number];
  /** [w, s, e, n] enclosing every route in the cluster. */
  bounds: [number, number, number, number];
  routeCount: number;
  /** Reverse-geocoded place name, or null until it resolves. */
  name: string | null;
}

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function haversineKm(a: [number, number], b: [number, number]): number {
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** Mean of a route's points — a cheap, stable representative location. */
function centroid(points: [number, number][]): [number, number] {
  let lng = 0;
  let lat = 0;
  for (const [x, y] of points) {
    lng += x;
    lat += y;
  }
  return [lng / points.length, lat / points.length];
}

interface MutableCluster {
  sumLng: number;
  sumLat: number;
  routeCount: number;
  bounds: [number, number, number, number];
}

function clusterCenter(c: MutableCluster): [number, number] {
  return [c.sumLng / c.routeCount, c.sumLat / c.routeCount];
}

/**
 * Greedily group routes whose centroids fall within `thresholdKm` of an existing
 * cluster centre. Returns the busiest areas first, capped at `limit`.
 */
export function clusterRoutes(
  routes: AreaRoute[],
  thresholdKm = 30,
  limit = 8,
): ActiveArea[] {
  const clusters: MutableCluster[] = [];

  for (const route of routes) {
    if (!route.points || route.points.length < 2) continue;
    const rep = centroid(route.points);

    let target = clusters.find((c) => haversineKm(clusterCenter(c), rep) <= thresholdKm);
    if (!target) {
      target = {
        sumLng: 0,
        sumLat: 0,
        routeCount: 0,
        bounds: [Infinity, Infinity, -Infinity, -Infinity],
      };
      clusters.push(target);
    }

    target.sumLng += rep[0];
    target.sumLat += rep[1];
    target.routeCount += 1;
    for (const [lng, lat] of route.points) {
      if (lng < target.bounds[0]) target.bounds[0] = lng;
      if (lat < target.bounds[1]) target.bounds[1] = lat;
      if (lng > target.bounds[2]) target.bounds[2] = lng;
      if (lat > target.bounds[3]) target.bounds[3] = lat;
    }
  }

  return clusters
    .sort((a, b) => b.routeCount - a.routeCount)
    .slice(0, limit)
    .map((c) => {
      const center = clusterCenter(c);
      return {
        id: `${center[0].toFixed(3)},${center[1].toFixed(3)}`,
        center,
        bounds: c.bounds,
        routeCount: c.routeCount,
        name: null,
      };
    });
}

const GEO_CACHE_PREFIX = "area-geocode:";

function readCache(key: string): string | null {
  try {
    return window.localStorage.getItem(GEO_CACHE_PREFIX + key);
  } catch {
    return null;
  }
}

function writeCache(key: string, value: string): void {
  try {
    window.localStorage.setItem(GEO_CACHE_PREFIX + key, value);
  } catch {
    /* storage unavailable / full — names just won't persist */
  }
}

/** Reverse-geocode a cluster centre to a city-level name via OSM Nominatim. */
async function reverseGeocode([lng, lat]: [number, number]): Promise<string | null> {
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const cached = readCache(key);
  if (cached) return cached;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10&addressdetails=1`,
      { headers: { "Accept-Language": "en" } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const a = data.address ?? {};
    const name: string | undefined =
      a.city ?? a.town ?? a.village ?? a.suburb ?? a.county ?? a.state ?? a.country;
    if (!name) return null;
    writeCache(key, name);
    return name;
  } catch {
    return null;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Cluster routes into active areas and resolve a place name for each. Names
 * stream in as they resolve; Nominatim's 1 req/sec policy is respected for
 * uncached lookups.
 */
export function useActiveAreas(routes: AreaRoute[]): ActiveArea[] {
  const clusters = useMemo(() => clusterRoutes(routes), [routes]);
  const [areas, setAreas] = useState<ActiveArea[]>(clusters);

  useEffect(() => {
    setAreas(clusters);
    let cancelled = false;

    (async () => {
      for (let i = 0; i < clusters.length; i += 1) {
        const cached = readCache(
          `${clusters[i].center[1].toFixed(2)},${clusters[i].center[0].toFixed(2)}`,
        );
        const name = await reverseGeocode(clusters[i].center);
        if (cancelled) return;
        if (name) {
          setAreas((prev) =>
            prev.map((a) => (a.id === clusters[i].id ? { ...a, name } : a)),
          );
        }
        // Throttle only network lookups, not cache hits.
        if (!cached && i < clusters.length - 1) await sleep(1100);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clusters]);

  return areas;
}
