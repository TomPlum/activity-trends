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

export interface StreakStats {
  /** Consecutive active days counting back from the most recent calendar day. */
  current: number;
  /** Longest run of consecutive active days in the set. */
  longest: number;
  /** Total number of active days. */
  activeDays: number;
}

/** Format a Date as a local `yyyy-MM-dd` key (matches Apple Health local dates). */
function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Compute current/longest streaks from a set of active `yyyy-MM-dd` dates.
 * "Active" days are days present in the set; gaps break a streak.
 *
 * All date maths is done on the local calendar (the set keys are local dates),
 * stepping a day at a time via `setDate` so DST transitions and timezone offset
 * can't skip, repeat, or misalign a day.
 */
export function streakStats(activeDates: Set<string>): StreakStats {
  const activeDays = activeDates.size;
  if (activeDays === 0) return { current: 0, longest: 0, activeDays: 0 };

  // Current streak: walk back one calendar day at a time from today. A missing
  // "today" is tolerated (data may not have synced yet) — start from yesterday.
  // Anchor at noon so day stepping never lands on a DST gap/overlap.
  let current = 0;
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  if (!activeDates.has(localDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (activeDates.has(localDateKey(cursor))) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Longest streak: scan chronologically, counting runs where each date is the
  // calendar day immediately after the previous one.
  const sorted = Array.from(activeDates).sort();
  let longest = 0;
  let run = 0;
  let prevKey: string | null = null;
  for (const ds of sorted) {
    if (prevKey != null) {
      const next = new Date(`${prevKey}T12:00:00`);
      next.setDate(next.getDate() + 1);
      run = localDateKey(next) === ds ? run + 1 : 1;
    } else {
      run = 1;
    }
    if (run > longest) longest = run;
    prevKey = ds;
  }

  return { current, longest, activeDays };
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
