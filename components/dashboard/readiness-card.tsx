"use client";

import { ReadinessGauge } from "./readiness-gauge";
import { Sparkline } from "@/components/charts/sparkline";
import type { ReadinessDay } from "@/lib/health/readiness";

/** Latest readiness gauge + contributor breakdown + a short trend. */
export function ReadinessCard({ days }: { days: ReadinessDay[] }) {
  const scored = days.filter((d) => d.score != null);
  const latest = scored[scored.length - 1];

  if (!latest) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Not enough HRV, resting-HR or sleep data yet to score readiness.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <ReadinessGauge score={latest.score} />

      <div className="w-full space-y-2">
        {latest.contributors.map((c) => (
          <div key={c.key} className="flex items-center gap-3 text-xs">
            <span className="w-24 shrink-0 text-muted-foreground">{c.label}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground/60"
                style={{ width: `${Math.round(c.score)}%` }}
              />
            </div>
            <span className="w-7 shrink-0 text-right tabular-nums">{Math.round(c.score)}</span>
          </div>
        ))}
      </div>

      {scored.length > 2 && (
        <div className="w-full">
          <p className="mb-1 text-[11px] text-muted-foreground">Last 30 days</p>
          <Sparkline
            data={scored.slice(-30).map((d) => ({ date: d.date, score: d.score }))}
            dataKey="score"
            color="var(--chart-1)"
            height={36}
          />
        </div>
      )}
    </div>
  );
}
