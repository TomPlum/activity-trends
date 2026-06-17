"use client";

import { eachDayOfInterval, format, getDay, startOfWeek, subDays } from "date-fns";
import { cn } from "@/lib/utils";

/**
 * GitHub-style calendar heatmap. `values` maps yyyy-MM-dd -> intensity 0..1.
 * Renders the last `weeks` weeks of activity.
 */
export function StreakHeatmap({
  values,
  weeks = 26,
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
    const weekIndex = Math.floor(
      (day.getTime() - start.getTime()) / (7 * 864e5),
    );
    if (weekIndex !== lastCol) {
      if (lastCol !== -1) columns.push(current);
      current = new Array(7).fill(null);
      lastCol = weekIndex;
    }
    const row = (getDay(day) + 6) % 7; // Mon=0
    current[row] = day;
  });
  columns.push(current);

  return (
    <div>
      {title && <p className="mb-2 text-sm font-medium text-muted-foreground">{title}</p>}
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-[3px]">
            {col.map((day, ri) => {
              if (!day) return <div key={ri} className="h-3 w-3" />;
              const key = format(day, "yyyy-MM-dd");
              const v = values[key] ?? 0;
              return (
                <div
                  key={ri}
                  title={`${format(day, "d MMM yyyy")}${v > 0 ? "" : " · no activity"}`}
                  className={cn("h-3 w-3 rounded-[3px]", v === 0 && "bg-muted")}
                  style={
                    v > 0
                      ? {
                          backgroundColor: `var(${colorVar})`,
                          opacity: 0.25 + Math.min(v, 1) * 0.75,
                        }
                      : undefined
                  }
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
