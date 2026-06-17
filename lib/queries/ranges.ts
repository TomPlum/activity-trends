import { subDays } from "date-fns";

export type RangeKey = "7d" | "30d" | "90d" | "1y" | "all";

export const RANGE_OPTIONS: { value: RangeKey; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "1y", label: "1 year" },
  { value: "all", label: "All time" },
];

const DAYS: Record<RangeKey, number | null> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "1y": 365,
  all: null,
};

/** ISO date (yyyy-MM-dd) marking the inclusive start of a range, or null for "all". */
export function rangeStartISO(range: RangeKey): string | null {
  const days = DAYS[range];
  if (days == null) return null;
  return subDays(new Date(), days).toISOString().slice(0, 10);
}

/** ISO timestamp marking the start of a range, or null for "all". */
export function rangeStartTimestamp(range: RangeKey): string | null {
  const days = DAYS[range];
  if (days == null) return null;
  return subDays(new Date(), days).toISOString();
}
