/** Numeric helpers for turning daily rows into KPIs. */

export function mean(values: Array<number | null | undefined>): number | null {
  const nums = values.filter((v): v is number => v != null && Number.isFinite(v));
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function sum(values: Array<number | null | undefined>): number {
  return values.reduce<number>((a, b) => a + (b != null && Number.isFinite(b) ? b : 0), 0);
}

export function latest(values: Array<number | null | undefined>): number | null {
  for (let i = values.length - 1; i >= 0; i--) {
    const v = values[i];
    if (v != null && Number.isFinite(v)) return v;
  }
  return null;
}

/** Percentage change of the most recent `window` vs the preceding `window`. */
export function deltaPct(
  values: Array<number | null | undefined>,
  window: number,
  agg: (v: Array<number | null | undefined>) => number | null = mean,
): number | null {
  if (values.length < window + 1) return null;
  const recent = agg(values.slice(-window));
  const prev = agg(values.slice(-window * 2, -window));
  if (recent == null || prev == null || prev === 0) return null;
  return ((recent - prev) / prev) * 100;
}
