import { createReadStream } from "node:fs";
import { SaxesParser, type SaxesTagPlain } from "saxes";
import {
  normaliseHumidity,
  parseHealthDate,
  parseLeadingNumber,
  shortRecordType,
  toCelsius,
} from "./util";

export interface WorkoutRow {
  activity_type: string;
  start_time: string;
  end_time: string | null;
  duration_min: number | null;
  distance_km: number | null;
  energy_kcal: number | null;
  avg_heart_rate: number | null;
  max_heart_rate: number | null;
  temperature_c: number | null;
  humidity: number | null;
  timezone: string | null;
  source: string | null;
}

export interface RecordRow {
  type: string;
  unit: string | null;
  value: number | null;
  start_time: string;
  end_time: string | null;
  source: string | null;
  /** Local calendar date (yyyy-MM-dd) taken from the export's local startDate. */
  day: string;
}

export interface SleepSegment {
  /** Raw HKCategoryValueSleepAnalysis* value. */
  value: string;
  start_time: string | null;
  end_time: string | null;
  /** Local wake date (end date) used to bucket the night. */
  wake_day: string;
  source: string | null;
}

export interface ActivitySummaryRow {
  date: string;
  active_energy_kcal: number | null;
  active_energy_goal: number | null;
  exercise_min: number | null;
  exercise_goal: number | null;
  stand_hours: number | null;
  stand_goal: number | null;
}

export interface ProfileRow {
  date_of_birth: string | null;
  biological_sex: string | null;
  blood_type: string | null;
}

export interface ExportHandlers {
  onProfile?: (p: ProfileRow) => void | Promise<void>;
  onWorkouts: (rows: WorkoutRow[]) => Promise<void>;
  onRecords: (rows: RecordRow[]) => Promise<void>;
  onActivitySummaries: (rows: ActivitySummaryRow[]) => Promise<void>;
  onSleepSegments?: (rows: SleepSegment[]) => Promise<void>;
}

/** Record types worth keeping — the ones that power the dashboard. */
export const DEFAULT_RECORD_TYPES = new Set([
  "StepCount",
  "DistanceWalkingRunning",
  "DistanceCycling",
  "DistanceSwimming",
  "FlightsClimbed",
  "ActiveEnergyBurned",
  "HeartRate",
  "RestingHeartRate",
  "WalkingHeartRateAverage",
  "HeartRateVariabilitySDNN",
  "VO2Max",
  "OxygenSaturation",
  "RespiratoryRate",
  "BodyMass",
  "BodyMassIndex",
  "BodyFatPercentage",
  "Height",
]);

export interface StreamOptions {
  batchSize?: number;
  recordTypes?: Set<string>;
}

interface WorkoutAccumulator extends WorkoutRow {
  _metaTimeZone?: string;
  _tempValue?: number | null;
  _tempUnit?: string;
}

/**
 * Streams a (potentially multi-GB) Apple Health export.xml, parsing it element
 * by element and flushing rows to the supplied handlers in batches. The read
 * stream is paused while a batch flushes so memory stays bounded.
 */
export async function streamHealthExport(
  filePath: string,
  handlers: ExportHandlers,
  options: StreamOptions = {},
): Promise<{
  workouts: number;
  records: number;
  activitySummaries: number;
  sleepSegments: number;
}> {
  const batchSize = options.batchSize ?? 5000;
  const recordTypes = options.recordTypes ?? DEFAULT_RECORD_TYPES;

  const workoutBuf: WorkoutRow[] = [];
  const recordBuf: RecordRow[] = [];
  const activityBuf: ActivitySummaryRow[] = [];
  const sleepBuf: SleepSegment[] = [];
  const counts = { workouts: 0, records: 0, activitySummaries: 0, sleepSegments: 0 };

  let current: WorkoutAccumulator | null = null;
  let correlationDepth = 0;

  const parser = new SaxesParser();

  const onOpen = (tag: SaxesTagPlain) => {
    const a = tag.attributes;
    switch (tag.name) {
      case "Correlation":
        correlationDepth++;
        break;
      case "Me":
        if (handlers.onProfile) {
          void handlers.onProfile({
            date_of_birth: (a.HKCharacteristicTypeIdentifierDateOfBirth as string) || null,
            biological_sex:
              ((a.HKCharacteristicTypeIdentifierBiologicalSex as string) || "").replace(
                /^HKBiologicalSex/,
                "",
              ) || null,
            blood_type:
              ((a.HKCharacteristicTypeIdentifierBloodType as string) || "").replace(
                /^HKBloodType/,
                "",
              ) || null,
          });
        }
        break;
      case "Workout": {
        const start = parseHealthDate(a.startDate as string);
        if (!start) break;
        current = {
          activity_type: (a.workoutActivityType as string).replace(
            /^HKWorkoutActivityType/,
            "",
          ),
          start_time: start,
          end_time: parseHealthDate(a.endDate as string),
          duration_min: parseLeadingNumber(a.duration as string),
          distance_km: parseLeadingNumber(a.totalDistance as string),
          energy_kcal: parseLeadingNumber(a.totalEnergyBurned as string),
          avg_heart_rate: null,
          max_heart_rate: null,
          temperature_c: null,
          humidity: null,
          timezone: null,
          source: (a.sourceName as string) || null,
        };
        break;
      }
      case "MetadataEntry": {
        if (!current) break;
        const key = a.key as string;
        const value = a.value as string;
        if (key === "HKTimeZone") current.timezone = value;
        else if (key === "HKWeatherTemperature") {
          current._tempValue = parseLeadingNumber(value);
          current._tempUnit = value;
        } else if (key === "HKWeatherHumidity") {
          current.humidity = normaliseHumidity(parseLeadingNumber(value));
        }
        break;
      }
      case "WorkoutStatistics": {
        if (!current) break;
        // HealthKit v14 moved energy/distance off the <Workout> element into
        // these child stats; older exports use Workout attributes (set above).
        const type = shortRecordType((a.type as string) ?? "");
        if (type === "HeartRate") {
          current.avg_heart_rate = parseLeadingNumber(a.average as string);
          current.max_heart_rate = parseLeadingNumber(a.maximum as string);
        } else if (type === "ActiveEnergyBurned") {
          current.energy_kcal = parseLeadingNumber(a.sum as string);
        } else if (
          type === "DistanceWalkingRunning" ||
          type === "DistanceCycling" ||
          type === "DistanceSwimming"
        ) {
          current.distance_km = parseLeadingNumber(a.sum as string);
        }
        break;
      }
      case "Record": {
        if (correlationDepth > 0) break; // avoid double-counting nested records
        const type = shortRecordType(a.type as string);
        const startRaw = a.startDate as string;
        if (!startRaw) break;

        if (type === "SleepAnalysis") {
          if (!handlers.onSleepSegments) break;
          const endRaw = (a.endDate as string) || startRaw;
          sleepBuf.push({
            value: (a.value as string) || "",
            start_time: parseHealthDate(startRaw),
            end_time: parseHealthDate(endRaw),
            wake_day: endRaw.slice(0, 10),
            source: (a.sourceName as string) || null,
          });
          break;
        }

        if (!recordTypes.has(type)) break;
        const start = parseHealthDate(startRaw);
        if (!start) break;
        recordBuf.push({
          type,
          unit: (a.unit as string) || null,
          value: parseLeadingNumber(a.value as string),
          start_time: start,
          end_time: parseHealthDate(a.endDate as string),
          source: (a.sourceName as string) || null,
          day: startRaw.slice(0, 10),
        });
        break;
      }
      case "ActivitySummary": {
        const date = (a.dateComponents as string) || null;
        if (!date) break;
        activityBuf.push({
          date,
          active_energy_kcal: parseLeadingNumber(a.activeEnergyBurned as string),
          active_energy_goal: parseLeadingNumber(a.activeEnergyBurnedGoal as string),
          exercise_min: parseLeadingNumber(a.appleExerciseTime as string),
          exercise_goal: parseLeadingNumber(a.appleExerciseTimeGoal as string),
          stand_hours: parseLeadingNumber(a.appleStandHours as string),
          stand_goal: parseLeadingNumber(a.appleStandHoursGoal as string),
        });
        break;
      }
    }
  };

  const onClose = (tag: SaxesTagPlain) => {
    if (tag.name === "Correlation") correlationDepth = Math.max(0, correlationDepth - 1);
    if (tag.name === "Workout" && current) {
      if (current._tempValue != null) {
        current.temperature_c =
          Math.round(toCelsius(current._tempValue, current._tempUnit) * 10) / 10;
      }
      delete current._tempValue;
      delete current._tempUnit;
      delete current._metaTimeZone;
      workoutBuf.push(current);
      current = null;
    }
  };

  parser.on("opentag", onOpen);
  parser.on("closetag", onClose);

  const stream = createReadStream(filePath, { encoding: "utf8", highWaterMark: 1 << 20 });

  const flush = async () => {
    if (workoutBuf.length) {
      counts.workouts += workoutBuf.length;
      await handlers.onWorkouts(workoutBuf.splice(0));
    }
    if (recordBuf.length) {
      counts.records += recordBuf.length;
      await handlers.onRecords(recordBuf.splice(0));
    }
    if (activityBuf.length) {
      counts.activitySummaries += activityBuf.length;
      await handlers.onActivitySummaries(activityBuf.splice(0));
    }
    if (sleepBuf.length && handlers.onSleepSegments) {
      counts.sleepSegments += sleepBuf.length;
      await handlers.onSleepSegments(sleepBuf.splice(0));
    }
  };

  for await (const chunk of stream) {
    parser.write(chunk as string);
    if (
      recordBuf.length >= batchSize ||
      workoutBuf.length >= batchSize ||
      activityBuf.length >= batchSize ||
      sleepBuf.length >= batchSize
    ) {
      await flush();
    }
  }
  parser.close();
  await flush();

  return counts;
}
