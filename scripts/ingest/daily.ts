import { DAILY_RULES, PCT_COLUMNS } from "./metric-config";

interface Bucket {
  sum: number;
  count: number;
}

/**
 * Accumulates daily_metrics in memory while the export streams, so the giant
 * high-frequency series (heart rate, energy, steps) never touch the database —
 * only their daily roll-ups do.
 */
export class DailyAccumulator {
  private agg = new Map<string, Map<string, Bucket>>(); // date -> column -> bucket
  private direct = new Map<string, Map<string, number>>(); // date -> column -> value

  private dayAgg(date: string): Map<string, Bucket> {
    let m = this.agg.get(date);
    if (!m) this.agg.set(date, (m = new Map()));
    return m;
  }

  private dayDirect(date: string): Map<string, number> {
    let m = this.direct.get(date);
    if (!m) this.direct.set(date, (m = new Map()));
    return m;
  }

  /** Tally a raw record value into its mapped daily column. */
  addRecord(date: string, type: string, value: number | null) {
    if (value == null || !Number.isFinite(value)) return;
    const rule = DAILY_RULES[type];
    if (!rule) return;
    const m = this.dayAgg(date);
    const b = m.get(rule.column) ?? { sum: 0, count: 0 };
    b.sum += value;
    b.count += 1;
    m.set(rule.column, b);
  }

  /** Set a single-valued daily column (rings, sleep totals). */
  setDirect(date: string, column: string, value: number | null) {
    if (value == null || !Number.isFinite(value)) return;
    this.dayDirect(date).set(column, value);
  }

  private static round(n: number): number {
    return Math.round(n * 1000) / 1000;
  }

  /** Produce daily_metrics insert rows. */
  finalize(): Array<Record<string, number | string | null>> {
    const dates = new Set([...this.agg.keys(), ...this.direct.keys()]);
    const rows: Array<Record<string, number | string | null>> = [];

    for (const date of dates) {
      const row: Record<string, number | string | null> = { date };

      const aggMap = this.agg.get(date);
      if (aggMap) {
        for (const [column, b] of aggMap) {
          const rule = Object.values(DAILY_RULES).find((r) => r.column === column)!;
          let v = rule.agg === "sum" ? b.sum : b.count ? b.sum / b.count : null;
          if (v != null && PCT_COLUMNS.has(column) && v <= 1.5) v *= 100;
          row[column] = v == null ? null : DailyAccumulator.round(v);
        }
      }

      const directMap = this.direct.get(date);
      if (directMap) {
        for (const [column, v] of directMap) row[column] = DailyAccumulator.round(v);
      }

      rows.push(row);
    }

    return rows;
  }
}
