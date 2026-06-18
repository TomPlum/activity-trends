/**
 * Apple Health ingestion CLI.
 *
 *   npm run ingest -- --export ./data/export.xml --routes ./data/workout-routes \
 *     [--ecg ./data/electrocardiograms] [--sleep-csv ./data/fallback/sleep.csv] \
 *     [--tz Europe/London] [--no-reset]
 *
 * Streams export.xml, tallying the giant high-frequency series (heart rate,
 * energy, steps…) into in-memory daily roll-ups so they never hit the database —
 * only a small set of low-volume series are stored raw. Builds sleep sessions
 * from native SleepAnalysis, links GPX routes, loads ECG recordings, then writes
 * daily_metrics. Re-runnable: resets the data tables first by default.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { createServiceClient, loadEnv } from "./supabase";
import {
  streamHealthExport,
  type ActivitySummaryRow,
  type RecordRow,
  type SleepSegment,
  type WorkoutRow,
} from "./health-export";
import { DailyAccumulator } from "./daily";
import { ingestRecordTypes, RAW_TYPES } from "./metric-config";
import { buildSleepSessions } from "./sleep-sessions";
import { parseEcgCsv } from "./ecg-csv";
import { parseGpx } from "./gpx";
import { parseSleepCsv } from "./sleep-csv";
import { heightToMeters } from "./util";

type DB = SupabaseClient<Database>;

interface Args {
  export?: string;
  routes?: string;
  ecg?: string;
  sleepCsv?: string;
  tz: string;
  reset: boolean;
  batch: number;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { tz: "Europe/London", reset: true, batch: 5000 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === "--export") args.export = next();
    else if (a === "--routes") args.routes = next();
    else if (a === "--ecg") args.ecg = next();
    else if (a === "--sleep-csv") args.sleepCsv = next();
    else if (a === "--tz") args.tz = next() ?? args.tz;
    else if (a === "--batch") args.batch = Number(next()) || args.batch;
    else if (a === "--no-reset") args.reset = false;
  }
  return args;
}

function die(msg: string): never {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}

async function exists(p: string): Promise<boolean> {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * Drop rows that share a conflict key, keeping the last. Apple Health exports
 * can contain duplicate workouts/records (same source re-imported); without this
 * an upsert hits "ON CONFLICT DO UPDATE command cannot affect row a second time".
 */
function dedupeByKey<T>(rows: T[], conflict: string): T[] {
  const cols = conflict.split(",").map((c) => c.trim());
  const map = new Map<string, T>();
  for (const r of rows) {
    const key = cols.map((c) => String((r as Record<string, unknown>)[c])).join("|");
    map.set(key, r);
  }
  return [...map.values()];
}

async function insertChunked<T>(
  db: DB,
  table: keyof Database["public"]["Tables"],
  rows: T[],
  opts?: { onConflict?: string },
) {
  const input = opts?.onConflict ? dedupeByKey(rows, opts.onConflict) : rows;
  const size = 1000;
  for (let i = 0; i < input.length; i += size) {
    const chunk = input.slice(i, i + size) as never[];
    const q = db.from(table);
    const { error } = opts?.onConflict
      ? await q.upsert(chunk, { onConflict: opts.onConflict, ignoreDuplicates: false })
      : await q.insert(chunk);
    if (error) die(`Insert into ${String(table)} failed: ${error.message}`);
  }
}

async function ingestExport(db: DB, file: string, batch: number, daily: DailyAccumulator) {
  console.log(`→ Streaming ${file} …`);
  const segments: SleepSegment[] = [];
  let rawBuf: Database["public"]["Tables"]["health_records"]["Insert"][] = [];
  let rawStored = 0;

  const flushRaw = async () => {
    if (rawBuf.length >= 1000) {
      rawStored += rawBuf.length;
      await insertChunked(db, "health_records", rawBuf);
      rawBuf = [];
    }
  };

  const counts = await streamHealthExport(
    file,
    {
      onProfile: async (p) => {
        await db.from("profile").upsert({ id: 1, ...p, updated_at: new Date().toISOString() });
      },
      onWorkouts: (rows: WorkoutRow[]) =>
        insertChunked(db, "workouts", rows, { onConflict: "activity_type,start_time" }),
      onRecords: async (rows: RecordRow[]) => {
        for (const r of rows) {
          daily.addRecord(r.day, r.type, r.value);
          if (r.type === "Height") daily.setHeight(r.day, heightToMeters(r.value, r.unit ?? undefined));
          if (RAW_TYPES.has(r.type)) {
            rawBuf.push({
              type: r.type,
              unit: r.unit,
              value: r.value,
              start_time: r.start_time,
              end_time: r.end_time,
              source: r.source,
            });
          }
        }
        await flushRaw();
      },
      onActivitySummaries: async (rows: ActivitySummaryRow[]) => {
        await insertChunked(db, "activity_summaries", rows, { onConflict: "date" });
        for (const a of rows) {
          daily.setDirect(a.date, "active_energy", a.active_energy_kcal);
          daily.setDirect(a.date, "exercise_min", a.exercise_min);
          daily.setDirect(a.date, "stand_hours", a.stand_hours);
        }
      },
      onSleepSegments: async (rows: SleepSegment[]) => {
        segments.push(...rows);
      },
    },
    { batchSize: batch, recordTypes: ingestRecordTypes() },
  );

  if (rawBuf.length) {
    rawStored += rawBuf.length;
    await insertChunked(db, "health_records", rawBuf);
  }

  console.log(
    `✓ Export: ${counts.workouts} workouts, ${counts.records} records scanned ` +
      `(${rawStored} kept raw, rest rolled up to daily), ` +
      `${counts.activitySummaries} activity days, ${counts.sleepSegments} sleep segments`,
  );
  return segments;
}

async function ingestSleepSegments(db: DB, segments: SleepSegment[], daily: DailyAccumulator) {
  if (!segments.length) return false;
  const { sessions, daily: sleepDaily } = buildSleepSessions(segments);
  await insertChunked(db, "sleep_sessions", sessions, { onConflict: "start_time" });
  for (const d of sleepDaily) {
    daily.setDirect(d.date, "sleep_min", d.sleep_min);
    daily.setDirect(d.date, "sleep_quality", d.sleep_quality);
  }
  console.log(`✓ Sleep: ${sessions.length} sessions from native SleepAnalysis`);
  return true;
}

async function ingestRoutes(db: DB, dir: string) {
  const files = (await readdir(dir)).filter((f) => f.toLowerCase().endsWith(".gpx"));
  if (!files.length) {
    console.log("→ No .gpx files found in routes dir; skipping.");
    return;
  }

  // PostgREST caps a select at ~1000 rows, so page through every workout.
  const workouts: { id: string; start_time: string }[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db
      .from("workouts")
      .select("id, start_time")
      .order("start_time")
      .range(from, from + 999);
    if (error) die(`Could not load workouts for route matching: ${error.message}`);
    if (!data?.length) break;
    workouts.push(...data);
    if (data.length < 1000) break;
  }
  const index = workouts
    .map((w) => ({ id: w.id, t: new Date(w.start_time).getTime() }))
    .sort((a, b) => a.t - b.t);

  const TOLERANCE_MS = 2 * 60 * 60 * 1000;
  const routeRows: Database["public"]["Tables"]["workout_routes"]["Insert"][] = [];
  let matched = 0;

  for (const f of files) {
    const parsed = parseGpx(await readFile(join(dir, f), "utf8"));
    if (!parsed.points.length || !parsed.startTime) continue;
    const t = new Date(parsed.startTime).getTime();

    let best: { id: string; diff: number } | null = null;
    for (const w of index) {
      const diff = Math.abs(w.t - t);
      if (!best || diff < best.diff) best = { id: w.id, diff };
      if (w.t - t > TOLERANCE_MS) break;
    }
    const workoutId = best && best.diff <= TOLERANCE_MS ? best.id : null;
    if (workoutId) matched++;
    routeRows.push({
      workout_id: workoutId,
      source: "Apple Health Export",
      created_date: parsed.startTime,
      point_count: parsed.points.length,
      distance_km: parsed.distanceKm,
      bounds: parsed.bounds,
      points: parsed.points,
    });
  }

  const seen = new Set<string>();
  const deduped = routeRows.filter((r) => {
    if (!r.workout_id || seen.has(r.workout_id)) return false;
    seen.add(r.workout_id);
    return true;
  });

  await insertChunked(db, "workout_routes", deduped, { onConflict: "workout_id" });
  console.log(`✓ Routes: ${deduped.length} linked (${matched} matched of ${files.length} files)`);
}

async function ingestEcg(db: DB, dir: string) {
  const files = (await readdir(dir)).filter((f) => f.toLowerCase().endsWith(".csv"));
  const rows: Database["public"]["Tables"]["ecg"]["Insert"][] = [];
  for (const f of files) {
    const e = parseEcgCsv(await readFile(join(dir, f), "utf8"));
    if (!e.recorded_at || !e.sample_count) continue;
    rows.push({
      recorded_at: e.recorded_at,
      classification: e.classification,
      symptoms: e.symptoms,
      sample_rate_hz: e.sample_rate_hz,
      unit: e.unit,
      device: e.device,
      software_version: e.software_version,
      sample_count: e.sample_count,
      samples: e.samples,
    });
  }
  if (!rows.length) {
    console.log("→ No ECG recordings parsed; skipping.");
    return;
  }
  await insertChunked(db, "ecg", rows, { onConflict: "recorded_at" });
  console.log(`✓ ECG: ${rows.length} recordings`);
}

async function ingestSleepCsv(db: DB, csvPath: string, daily: DailyAccumulator) {
  const rows = parseSleepCsv(await readFile(csvPath, "utf8"));
  if (!rows.length) return;
  await insertChunked(db, "sleep_sessions", rows, { onConflict: "start_time" });
  for (const r of rows) {
    if (!r.is_nap && r.end_time) {
      const day = r.end_time.slice(0, 10);
      daily.setDirect(day, "sleep_min", r.duration_min ?? 0);
      daily.setDirect(day, "sleep_quality", r.quality_pct);
    }
  }
  console.log(`✓ Sleep: ${rows.length} sessions from Pillow CSV (fallback)`);
}

async function main() {
  loadEnv();
  const args = parseArgs(process.argv.slice(2));
  if (!args.export) die("Missing --export <path to export.xml>.");
  const exportPath = resolve(args.export);
  if (!(await exists(exportPath))) die(`Export file not found: ${exportPath}`);

  const db = createServiceClient();
  const daily = new DailyAccumulator();

  if (args.reset) {
    console.log("→ Resetting data tables …");
    const { error } = await db.rpc("reset_health_data");
    if (error) die(`reset_health_data failed: ${error.message}`);
  }

  const segments = await ingestExport(db, exportPath, args.batch, daily);

  const haveNativeSleep = await ingestSleepSegments(db, segments, daily);

  if (args.routes && (await exists(resolve(args.routes)))) {
    await ingestRoutes(db, resolve(args.routes));
  }

  const ecgDir = args.ecg ?? join(exportPath, "..", "electrocardiograms");
  if (await exists(ecgDir)) await ingestEcg(db, ecgDir);

  // Native SleepAnalysis wins; fall back to the Pillow CSV only if absent.
  if (!haveNativeSleep) {
    const sleepPath = args.sleepCsv ?? "data/fallback/sleep.csv";
    if (await exists(resolve(sleepPath))) await ingestSleepCsv(db, resolve(sleepPath), daily);
  }

  console.log("→ Writing daily_metrics …");
  await insertChunked(db, "daily_metrics", daily.finalize(), { onConflict: "date" });

  console.log("\n✓ Ingest complete.\n");
}

main().catch((e) => die(e instanceof Error ? e.message : String(e)));
