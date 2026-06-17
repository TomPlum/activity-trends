/** Parsing helpers shared by the Apple Health ingestion modules. */

/**
 * Apple Health timestamps look like "2017-10-02 19:54:13 +0100". Normalise to
 * an ISO 8601 string (with the offset preserved) that Postgres timestamptz
 * accepts. Returns null for unparseable input.
 */
export function parseHealthDate(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const m = raw.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})\s*([+-]\d{2}):?(\d{2})$/);
  if (m) {
    const d = new Date(`${m[1]}T${m[2]}${m[3]}:${m[4]}`);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Strip the leading float from values like "53 degF" or "8300 %". */
export function parseLeadingNumber(raw: string | undefined | null): number | null {
  if (raw == null) return null;
  const m = String(raw).match(/-?\d+(\.\d+)?/);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) ? n : null;
}

export function toCelsius(value: number, unitHint: string | undefined): number {
  if (unitHint && /f/i.test(unitHint)) return (value - 32) * (5 / 9);
  return value;
}

/** Humidity comes through scaled (e.g. "8300 %"); clamp to a 0-100 percentage. */
export function normaliseHumidity(value: number | null): number | null {
  if (value == null) return null;
  let v = value;
  while (v > 100) v /= 100;
  return Math.round(v * 10) / 10;
}

/** Haversine distance in km between two [lon, lat] points. */
export function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[1] - a[1]) * Math.PI) / 180;
  const dLon = ((b[0] - a[0]) * Math.PI) / 180;
  const lat1 = (a[1] * Math.PI) / 180;
  const lat2 = (b[1] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** HealthKit identifier -> short type, e.g. HKQuantityTypeIdentifierStepCount -> StepCount. */
export function shortRecordType(raw: string): string {
  return raw
    .replace(/^HKQuantityTypeIdentifier/, "")
    .replace(/^HKCategoryTypeIdentifier/, "")
    .replace(/^HKDataType/, "");
}
