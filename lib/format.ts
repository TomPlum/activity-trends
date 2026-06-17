import { format, formatDistanceToNowStrict, parseISO } from "date-fns";

/** Compact number, e.g. 12450 -> "12.5k". */
export function compactNumber(value: number | null | undefined, digits = 1): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-GB", {
    notation: "compact",
    maximumFractionDigits: digits,
  }).format(value);
}

export function number(value: number | null | undefined, digits = 0): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: digits,
  }).format(value);
}

/** Minutes -> "1h 23m" / "45m". */
export function duration(min: number | null | undefined): string {
  if (min == null || Number.isNaN(min)) return "—";
  const total = Math.round(min);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function distanceKm(km: number | null | undefined, digits = 2): string {
  if (km == null || Number.isNaN(km)) return "—";
  return `${number(km, digits)} km`;
}

export function pace(km: number | null | undefined, min: number | null | undefined): string {
  if (!km || !min || km <= 0) return "—";
  const secsPerKm = (min * 60) / km;
  const m = Math.floor(secsPerKm / 60);
  const s = Math.round(secsPerKm % 60);
  return `${m}:${s.toString().padStart(2, "0")} /km`;
}

function toDate(value: string | Date): Date {
  return typeof value === "string" ? parseISO(value) : value;
}

export function shortDate(value: string | Date): string {
  return format(toDate(value), "d MMM yyyy");
}

export function dayMonth(value: string | Date): string {
  return format(toDate(value), "d MMM");
}

export function timeOfDay(value: string | Date): string {
  return format(toDate(value), "HH:mm");
}

export function relativeTime(value: string | Date): string {
  return `${formatDistanceToNowStrict(toDate(value))} ago`;
}
