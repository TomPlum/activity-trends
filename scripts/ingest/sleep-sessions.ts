import type { SleepSegment } from "./health-export";

export interface SleepSessionRow {
  start_time: string;
  end_time: string | null;
  duration_min: number;
  quality_pct: number | null;
  awake_min: number;
  rem_min: number;
  light_min: number;
  deep_min: number;
  sounds_recorded: number | null;
  mood: string | null;
  is_nap: boolean;
  source: string;
}

export interface SleepDaily {
  date: string;
  sleep_min: number;
  sleep_quality: number | null;
}

type Stage = "deep" | "rem" | "light" | "awake" | "inBed" | null;

function stageOf(value: string): Stage {
  if (value.includes("Deep")) return "deep";
  if (value.includes("REM")) return "rem";
  if (value.includes("Core") || value.includes("Unspecified")) return "light";
  if (value.endsWith("Asleep")) return "light"; // legacy generic "Asleep"
  if (value.includes("Awake")) return "awake";
  if (value.includes("InBed")) return "inBed";
  return null;
}

const GAP_MS = 60 * 60 * 1000; // a >1h gap starts a new sleep session

interface SourceAcc {
  start: number;
  end: number;
  deep: number;
  rem: number;
  light: number;
  awake: number;
  inBed: number;
}

interface Group {
  end: number; // latest end seen across any source (for gap detection)
  wakeDay: string;
  bySource: Map<string, SourceAcc>;
}

function minutes(start: string | null, end: string | null): number {
  if (!start || !end) return 0;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return ms > 0 ? ms / 60000 : 0;
}

/** Pick the most complete recording for a night: prefer a source with granular
 * stages (deep/rem), then the one with the most time asleep. */
function dominantSource(bySource: Map<string, SourceAcc>): { name: string; acc: SourceAcc } | null {
  let best: { name: string; acc: SourceAcc; asleep: number; granular: boolean } | null = null;
  for (const [name, acc] of bySource) {
    const asleep = acc.deep + acc.rem + acc.light;
    const granular = acc.deep > 0 || acc.rem > 0;
    if (
      !best ||
      (granular && !best.granular) ||
      (granular === best.granular && asleep > best.asleep)
    ) {
      best = { name, acc, asleep, granular };
    }
  }
  return best ? { name: best.name, acc: best.acc } : null;
}

/**
 * Group raw sleep segments into nightly sessions. When more than one source
 * (e.g. iPhone + Apple Watch) records the same night, we use only the dominant
 * source's stages rather than summing them — otherwise totals roughly double.
 */
export function buildSleepSessions(segments: SleepSegment[]): {
  sessions: SleepSessionRow[];
  daily: SleepDaily[];
} {
  const valid = segments
    .filter((s) => s.start_time && s.end_time)
    .sort((a, b) => new Date(a.start_time!).getTime() - new Date(b.start_time!).getTime());

  const groups: Group[] = [];
  let cur: Group | null = null;

  for (const seg of valid) {
    const start = new Date(seg.start_time!).getTime();
    const end = new Date(seg.end_time!).getTime();
    const stage = stageOf(seg.value);
    const mins = minutes(seg.start_time, seg.end_time);
    const src = seg.source ?? "Apple Health";

    if (!cur || start - cur.end > GAP_MS) {
      cur = { end, wakeDay: seg.wake_day, bySource: new Map() };
      groups.push(cur);
    }
    cur.end = Math.max(cur.end, end);
    cur.wakeDay = seg.wake_day;

    let acc = cur.bySource.get(src);
    if (!acc) {
      acc = { start, end, deep: 0, rem: 0, light: 0, awake: 0, inBed: 0 };
      cur.bySource.set(src, acc);
    }
    acc.start = Math.min(acc.start, start);
    acc.end = Math.max(acc.end, end);
    if (stage && stage !== "inBed") acc[stage] += mins;
    else if (stage === "inBed") acc.inBed += mins;
  }

  const round = (n: number) => Math.round(n);
  const sessions: SleepSessionRow[] = [];
  const dailyMap = new Map<string, { sleep: number; qSum: number; qCount: number }>();

  for (const g of groups) {
    const winner = dominantSource(g.bySource);
    if (!winner) continue;
    const { deep, rem, light, awake, inBed, start, end } = winner.acc;
    const asleep = deep + rem + light;
    if (asleep === 0) continue; // in-bed only, no actual sleep recorded

    const denom = Math.max(inBed, asleep + awake);
    const quality = denom > 0 ? Math.min(100, (asleep / denom) * 100) : null;
    const isNap = asleep < 90;

    sessions.push({
      start_time: new Date(start).toISOString(),
      end_time: new Date(end).toISOString(),
      duration_min: round(asleep),
      quality_pct: quality == null ? null : round(quality),
      awake_min: round(awake),
      rem_min: round(rem),
      light_min: round(light),
      deep_min: round(deep),
      sounds_recorded: null,
      mood: null,
      is_nap: isNap,
      source: winner.name,
    });

    if (!isNap) {
      const d = dailyMap.get(g.wakeDay) ?? { sleep: 0, qSum: 0, qCount: 0 };
      d.sleep += asleep;
      if (quality != null) {
        d.qSum += quality;
        d.qCount += 1;
      }
      dailyMap.set(g.wakeDay, d);
    }
  }

  const daily: SleepDaily[] = [...dailyMap.entries()].map(([date, d]) => ({
    date,
    sleep_min: round(d.sleep),
    sleep_quality: d.qCount ? round(d.qSum / d.qCount) : null,
  }));

  return { sessions, daily };
}
