"use client";

import { useEffect, useMemo, useState } from "react";

export interface AreaRoute {
  points: [number, number][];
  activityType: string;
  distanceKm: number;
  /** ISO start time, used for first/last-visit dates. */
  date: string | null;
}

export interface AreaSport {
  activityType: string;
  count: number;
}

export interface ActiveArea {
  id: string;
  /** [lng, lat] centroid used for fly-to framing and geocoding. */
  center: [number, number];
  /** [w, s, e, n] enclosing every route in the cluster. */
  bounds: [number, number, number, number];
  routeCount: number;
  totalDistanceKm: number;
  /** Sports recorded here, busiest first. */
  sports: AreaSport[];
  /** Earliest / latest route start time (ISO), or null. */
  firstDate: string | null;
  lastDate: string | null;
  /** Reverse-geocoded place name, or null until it resolves. */
  name: string | null;
  /** Reverse-geocoded country, or null until it resolves. */
  country: string | null;
}

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineKm(a: [number, number], b: [number, number]): number {
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
  totalDistanceKm: number;
  sports: Map<string, number>;
  firstDate: string | null;
  lastDate: string | null;
  bounds: [number, number, number, number];
}

function clusterCenter(c: MutableCluster): [number, number] {
  return [c.sumLng / c.routeCount, c.sumLat / c.routeCount];
}

/**
 * Greedily group routes whose centroids fall within `thresholdKm` of an existing
 * cluster centre. Returns every area, busiest first.
 */
export function clusterRoutes(routes: AreaRoute[], thresholdKm = 30): ActiveArea[] {
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
        totalDistanceKm: 0,
        sports: new Map(),
        firstDate: null,
        lastDate: null,
        bounds: [Infinity, Infinity, -Infinity, -Infinity],
      };
      clusters.push(target);
    }

    target.sumLng += rep[0];
    target.sumLat += rep[1];
    target.routeCount += 1;
    target.totalDistanceKm += route.distanceKm;
    target.sports.set(route.activityType, (target.sports.get(route.activityType) ?? 0) + 1);
    if (route.date) {
      if (!target.firstDate || route.date < target.firstDate) target.firstDate = route.date;
      if (!target.lastDate || route.date > target.lastDate) target.lastDate = route.date;
    }
    for (const [lng, lat] of route.points) {
      if (lng < target.bounds[0]) target.bounds[0] = lng;
      if (lat < target.bounds[1]) target.bounds[1] = lat;
      if (lng > target.bounds[2]) target.bounds[2] = lng;
      if (lat > target.bounds[3]) target.bounds[3] = lat;
    }
  }

  return clusters
    .sort((a, b) => b.routeCount - a.routeCount)
    .map((c) => {
      const center = clusterCenter(c);
      return {
        id: `${center[0].toFixed(3)},${center[1].toFixed(3)}`,
        center,
        bounds: c.bounds,
        routeCount: c.routeCount,
        totalDistanceKm: c.totalDistanceKm,
        sports: Array.from(c.sports, ([activityType, count]) => ({ activityType, count })).sort(
          (a, b) => b.count - a.count,
        ),
        firstDate: c.firstDate,
        lastDate: c.lastDate,
        name: null,
        country: null,
      };
    });
}

// Only the busiest areas get reverse-geocoded — keeps us well within Nominatim's
// usage policy while still naming every place that matters.
const GEOCODE_LIMIT = 12;
const GEO_CACHE_PREFIX = "area-geocode:";

interface GeoResult {
  name: string;
  country: string | null;
}

function cacheKey(center: [number, number]): string {
  return `${center[1].toFixed(2)},${center[0].toFixed(2)}`;
}

function readCache(key: string): GeoResult | null {
  try {
    const raw = window.localStorage.getItem(GEO_CACHE_PREFIX + key);
    return raw ? (JSON.parse(raw) as GeoResult) : null;
  } catch {
    return null;
  }
}

function writeCache(key: string, value: GeoResult): void {
  try {
    window.localStorage.setItem(GEO_CACHE_PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage unavailable / full — names just won't persist */
  }
}

/** Reverse-geocode a cluster centre to a city + country via OSM Nominatim. */
async function reverseGeocode(center: [number, number]): Promise<GeoResult | null> {
  const key = cacheKey(center);
  const cached = readCache(key);
  if (cached) return cached;

  try {
    const [lng, lat] = center;
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
    const result: GeoResult = { name, country: a.country ?? null };
    writeCache(key, result);
    return result;
  } catch {
    return null;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Cluster routes into active areas and resolve a name + country for the busiest
 * ones. Names stream in as they resolve; Nominatim's 1 req/sec policy is
 * respected for uncached lookups.
 */
export function useActiveAreas(routes: AreaRoute[]): ActiveArea[] {
  const clusters = useMemo(() => clusterRoutes(routes), [routes]);
  const [areas, setAreas] = useState<ActiveArea[]>(clusters);

  useEffect(() => {
    setAreas(clusters);
    let cancelled = false;

    (async () => {
      const targets = clusters.slice(0, GEOCODE_LIMIT);
      for (let i = 0; i < targets.length; i += 1) {
        const cached = readCache(cacheKey(targets[i].center));
        const geo = await reverseGeocode(targets[i].center);
        if (cancelled) return;
        if (geo) {
          setAreas((prev) =>
            prev.map((a) =>
              a.id === targets[i].id ? { ...a, name: geo.name, country: geo.country } : a,
            ),
          );
        }
        // Throttle only network lookups, not cache hits.
        if (!cached && i < targets.length - 1) await sleep(1100);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clusters]);

  return areas;
}
