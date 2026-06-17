/**
 * Apple Health ingestion CLI.
 *
 *   npm run ingest -- --export ./data/export.xml --routes ./data/workout-routes \
 *     [--sleep-csv ./data/fallback/sleep.csv] [--tz Europe/London] [--no-reset]
 *
 * Streams export.xml, loads workouts / records / activity summaries, links GPX
 * routes, loads sleep, then rebuilds daily_metrics. Writes via the Supabase
 * secret key (bypasses RLS). Re-runnable: resets the data tables first by default.
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
  type WorkoutRow,
} from "./health-export";
import { parseGpx } from "./gpx";
import { parseSleepCsv } from "./sleep-csv";

type DB = SupabaseClient<Database>;

interface Args {
  export?: string;
  routes?: string;
  sleepCsv?: string;
  tz: string;
  reset: boolean;
  batch: number;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { tz: "Europe/London", reset: true, batch: 2000 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === "--export") args.export = next();
    else if (a === "--routes") args.routes = next();
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

async function insertChunked<T>(
  db: DB,
  table: keyof Database["public"]["Tables"],
  rows: T[],
  opts?: { onConflict?: string },
) {
  const size = 1000;
  for (let i = 0; i < rows.length; i += size) {
    const chunk = rows.slice(i, i + size) as never[];
    const q = db.from(table);
    const { error } = opts?.onConflict
      ? await q.upsert(chunk, { onConflict: opts.onConflict, ignoreDuplicates: false })
      : await q.insert(chunk);
    if (error) die(`Insert into ${String(table)} failed: ${error.message}`);
  }
}

async function ingestExport(db: DB, file: string, batch: number) {
  console.log(`→ Streaming ${file} …`);
  let lastLog = Date.now();
  const counts = await streamHealthExport(
    file,
    {
      onProfile: async (p) => {
        await db.from("profile").upsert({ id: 1, ...p, updated_at: new Date().toISOString() });
      },
      onWorkouts: (rows: WorkoutRow[]) =>
        insertChunked(db, "workouts", rows, { onConflict: "activity_type,start_time" }),
      onRecords: async (rows: RecordRow[]) => {
        await insertChunked(db, "health_records", rows);
        if (Date.now() - lastLog > 3000) {
          process.stdout.write(`   …records streamed\r`);
          lastLog = Date.now();
        }
      },
      onActivitySummaries: (rows: ActivitySummaryRow[]) =>
        insertChunked(db, "activity_summaries", rows, { onConflict: "date" }),
    },
    { batchSize: batch },
  );
  console.log(
    `✓ Export: ${counts.workouts} workouts, ${counts.records} records, ${counts.activitySummaries} activity summaries`,
  );
}

async function ingestRoutes(db: DB, dir: string) {
  const files = (await readdir(dir)).filter((f) => f.toLowerCase().endsWith(".gpx"));
  if (!files.length) {
    console.log("→ No .gpx files found in routes dir; skipping.");
    return;
  }

  // Build a lookup of workout id + start epoch to match routes by time.
  const { data: workouts, error } = await db.from("workouts").select("id, start_time");
  if (error) die(`Could not load workouts for route matching: ${error.message}`);
  const index = (workouts ?? [])
    .map((w) => ({ id: w.id, t: new Date(w.start_time).getTime() }))
    .sort((a, b) => a.t - b.t);

  const TOLERANCE_MS = 2 * 60 * 60 * 1000; // 2 hours
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

  // Only one route per workout (unique workout_id) — drop unmatched dupes.
  const seen = new Set<string>();
  const deduped = routeRows.filter((r) => {
    if (!r.workout_id) return false;
    if (seen.has(r.workout_id)) return false;
    seen.add(r.workout_id);
    return true;
  });

  await insertChunked(db, "workout_routes", deduped, { onConflict: "workout_id" });
  console.log(`✓ Routes: ${deduped.length} linked to workouts (${matched} matched of ${files.length} files)`);
}

async function ingestSleep(db: DB, csvPath: string) {
  const rows = parseSleepCsv(await readFile(csvPath, "utf8"));
  if (!rows.length) {
    console.log("→ No sleep rows parsed; skipping.");
    return;
  }
  await insertChunked(db, "sleep_sessions", rows, { onConflict: "start_time" });
  console.log(`✓ Sleep: ${rows.length} sessions`);
}

async function main() {
  loadEnv();
  const args = parseArgs(process.argv.slice(2));
  if (!args.export) {
    die("Missing --export <path to export.xml>. See scripts/ingest/index.ts for usage.");
  }
  const exportPath = resolve(args.export);
  if (!(await exists(exportPath))) die(`Export file not found: ${exportPath}`);

  const db = createServiceClient();

  if (args.reset) {
    console.log("→ Resetting data tables …");
    const { error } = await db.rpc("reset_health_data");
    if (error) die(`reset_health_data failed: ${error.message}`);
  }

  await ingestExport(db, exportPath, args.batch);

  if (args.routes && (await exists(resolve(args.routes)))) {
    await ingestRoutes(db, resolve(args.routes));
  } else if (args.routes) {
    console.log(`→ Routes dir not found: ${args.routes}; skipping.`);
  }

  // Sleep: explicit CSV, else the bundled Pillow fallback if present.
  const sleepPath = args.sleepCsv ?? "data/fallback/sleep.csv";
  if (await exists(resolve(sleepPath))) {
    await ingestSleep(db, resolve(sleepPath));
  } else {
    console.log("→ No sleep CSV found; skipping sleep.");
  }

  console.log(`→ Rebuilding daily_metrics (tz=${args.tz}) …`);
  const { error: rollupErr } = await db.rpc("refresh_daily_metrics", { tz: args.tz });
  if (rollupErr) die(`refresh_daily_metrics failed: ${rollupErr.message}`);

  console.log("\n✓ Ingest complete.\n");
}

main().catch((e) => die(e instanceof Error ? e.message : String(e)));
