import { SaxesParser } from "saxes";
import { haversineKm } from "./util";

export interface ParsedRoute {
  /** [lon, lat] pairs in GeoJSON axis order. */
  points: [number, number][];
  bounds: [number, number, number, number] | null; // [w, s, e, n]
  distanceKm: number;
  /** Route start time (metadata/time or first trkpt time). */
  startTime: string | null;
}

/** Parse a single Apple Health GPX route file's contents. */
export function parseGpx(xml: string): ParsedRoute {
  const points: [number, number][] = [];
  const parser = new SaxesParser();

  let metadataTime: string | null = null;
  let firstTrkptTime: string | null = null;
  let inMetadata = false;
  let inTimeTag = false;

  parser.on("opentag", (tag) => {
    if (tag.name === "metadata") inMetadata = true;
    if (tag.name === "time") inTimeTag = true;
    if (tag.name === "trkpt") {
      const lon = Number(tag.attributes.lon as string);
      const lat = Number(tag.attributes.lat as string);
      if (Number.isFinite(lon) && Number.isFinite(lat)) points.push([lon, lat]);
    }
  });

  parser.on("text", (text) => {
    if (!inTimeTag) return;
    const t = text.trim();
    if (!t) return;
    if (inMetadata && !metadataTime) metadataTime = t;
    else if (!firstTrkptTime && !inMetadata) firstTrkptTime = t;
  });

  parser.on("closetag", (tag) => {
    if (tag.name === "metadata") inMetadata = false;
    if (tag.name === "time") inTimeTag = false;
  });

  parser.write(xml).close();

  let distanceKm = 0;
  let west = Infinity,
    south = Infinity,
    east = -Infinity,
    north = -Infinity;
  for (let i = 0; i < points.length; i++) {
    const [lon, lat] = points[i];
    west = Math.min(west, lon);
    east = Math.max(east, lon);
    south = Math.min(south, lat);
    north = Math.max(north, lat);
    if (i > 0) distanceKm += haversineKm(points[i - 1], points[i]);
  }

  return {
    points,
    bounds: points.length ? [west, south, east, north] : null,
    distanceKm: Math.round(distanceKm * 1000) / 1000,
    startTime: metadataTime ?? firstTrkptTime,
  };
}
