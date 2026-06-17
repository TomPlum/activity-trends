"use client";

import { eachDayOfInterval, format, getDay, startOfWeek, subDays } from "date-fns";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LEGEND_STEPS = [0, 0.25, 0.5, 0.75, 1];

/**
 * GitHub-style calendar heatmap. `values` maps yyyy-MM-dd -> intensity 0..1.
 * Cells flex to fill the available width; renders the last `weeks` weeks with
 * month + weekday labels and a Less→More legend.
 */
export function StreakHeatmap({
  values,
  weeks = 53,
  colorVar = "--chart-1",
  title,
}: {
  values: Record<string, number>;
  weeks?: number;
  colorVar?: string;
  title?: string;
}) {
  const today = new Date();
  const start = startOfWeek(subDays(today, weeks * 7 - 1), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end: today });

  // bucket into columns (weeks) of 7 rows (Mon..Sun)
  const columns: (Date | null)[][] = [];
  let current: (Date | null)[] = new Array(7).fill(null);
  let lastCol = -1;
  days.forEach((day) => {
    const weekIndex = Math.floor((day.getTime() - start.getTime()) / (7 * 864e5));
    if (weekIndex !== lastCol) {
      if (lastCol !== -1) columns.push(current);
      current = new Array(7).fill(null);
      lastCol = weekIndex;
    }
    const row = (getDay(day) + 6) % 7; // Mon=0
    current[row] = day;
  });
  columns.push(current);

  // Month label per column: shown on the first column of each new month.
  let prevMonth = -1;
  const monthLabels = columns.map((col) => {
    const firstDay = col.find((d): d is Date => d != null);
    if (!firstDay) return "";
    const mo = firstDay.getMonth();
    if (mo !== prevMonth) {
      prevMonth = mo;
      return format(firstDay, "MMM");
    }
    return "";
  });

  const swatch = (v: number) =>
    v > 0
      ? { backgroundColor: `var(${colorVar})`, opacity: 0.2 + Math.min(v, 1) * 0.8 }
      : undefined;

  return (
    <div>
      {title && <p className="mb-2 text-sm font-medium text-muted-foreground">{title}</p>}

      <div className="flex items-stretch gap-2">
        {/* Weekday labels */}
        <div className="flex shrink-0 flex-col text-[10px] leading-none text-muted-foreground">
          <div className="h-4" />
          <div
            className="grid flex-1 gap-[3px]"
            style={{ gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}
          >
            {WEEKDAYS.map((d, i) => (
              <div key={d} className="flex items-center">
                {i % 2 === 0 ? d : ""}
              </div>
            ))}
          </div>
        </div>

        {/* Months + cells */}
        <div className="min-w-0 flex-1">
          <div
            className="grid h-4 gap-[3px] text-[10px] leading-none text-muted-foreground"
            style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
          >
            {monthLabels.map((lbl, i) => (
              <div key={i} className="whitespace-nowrap">
                {lbl}
              </div>
            ))}
          </div>

          <div
            className="grid gap-[3px]"
            style={{
              gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
              gridTemplateRows: "repeat(7, auto)",
              gridAutoFlow: "column",
            }}
          >
            {columns.flatMap((col, ci) =>
              col.map((day, ri) => {
                if (!day) return <div key={`${ci}-${ri}`} className="aspect-square" />;
                const key = format(day, "yyyy-MM-dd");
                const v = values[key] ?? 0;
                return (
                  <div
                    key={`${ci}-${ri}`}
                    title={`${format(day, "d MMM yyyy")}${v > 0 ? "" : " · no activity"}`}
                    className={cn("aspect-square rounded-[2px]", v === 0 && "bg-muted")}
                    style={swatch(v)}
                  />
                );
              }),
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
        <span>Less</span>
        {LEGEND_STEPS.map((o) => (
          <span
            key={o}
            className={cn("h-3 w-3 rounded-[2px]", o === 0 && "bg-muted")}
            style={swatch(o)}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
