import { parseHealthDate } from "./util";

export interface SleepRow {
  start_time: string;
  end_time: string | null;
  duration_min: number | null;
  quality_pct: number | null;
  awake_min: number | null;
  rem_min: number | null;
  light_min: number | null;
  deep_min: number | null;
  sounds_recorded: number | null;
  mood: string | null;
  is_nap: boolean;
  source: string;
}

function num(v: string | undefined): number | null {
  if (v == null) return null;
  const t = v.trim();
  if (!t || /^\(null\)$/i.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function nullable(v: string | undefined): string | null {
  const t = (v ?? "").trim();
  return !t || /^\(null\)$/i.test(t) ? null : t;
}

/**
 * Parse a Pillow sleep CSV export. Header:
 * Start Time, End Time, Duration (mins), Nap, Sleep Quality (%), Time Awake,
 * Time in REM, Time in Light, Time in Deep, Sounds Recorded, Wake-up mood
 */
export function parseSleepCsv(content: string): SleepRow[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const rows: SleepRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(",").map((c) => c.trim());
    const start = parseHealthDate(nullable(cells[0]) ?? undefined);
    if (!start) continue;
    rows.push({
      start_time: start,
      end_time: parseHealthDate(nullable(cells[1]) ?? undefined),
      duration_min: num(cells[2]),
      is_nap: /^yes$/i.test(cells[3] ?? ""),
      quality_pct: num(cells[4]),
      awake_min: num(cells[5]),
      rem_min: num(cells[6]),
      light_min: num(cells[7]),
      deep_min: num(cells[8]),
      sounds_recorded: num(cells[9]),
      mood: nullable(cells[10]),
      source: "Pillow CSV",
    });
  }
  return rows;
}
