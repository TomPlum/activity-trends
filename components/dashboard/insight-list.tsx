import { TrendingDown, TrendingUp } from "lucide-react";
import type { Insight } from "@/lib/insights/engine";
import { cn } from "@/lib/utils";

export function InsightList({ insights }: { insights: Insight[] }) {
  if (!insights.length) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Not enough overlapping data yet to spot reliable patterns.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {insights.map((ins) => (
        <li key={ins.id} className="flex items-start gap-3 rounded-lg border bg-muted/20 p-3">
          <span
            className={cn(
              "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted",
              ins.accent,
            )}
          >
            {ins.sentiment === "positive" ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
          </span>
          <div className="min-w-0">
            <p className="text-sm leading-snug">{ins.text}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {ins.tag} · r {ins.r.toFixed(2)} · {ins.n} days
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
