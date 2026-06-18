import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkline } from "@/components/charts/sparkline";

export interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  icon?: LucideIcon;
  accent?: string; // tailwind text colour token, e.g. "text-chart-1"
  /** Percentage change vs previous period; positive renders green by default. */
  delta?: number | null;
  /** If true, a downward delta is the "good" direction (e.g. resting HR). */
  invertDelta?: boolean;
  /** Secondary stat shown beneath the value, e.g. "520 avg/session". */
  sub?: ReactNode;
  spark?: { data: Array<Record<string, number | null | string>>; dataKey: string; color?: string };
}

export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  accent = "text-chart-1",
  delta,
  invertDelta = false,
  sub,
  spark,
}: StatCardProps) {
  const hasDelta = delta != null && Number.isFinite(delta);
  const up = (delta ?? 0) >= 0;
  const good = invertDelta ? !up : up;

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {Icon && <Icon className={cn("h-4 w-4", accent)} />}
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-semibold tracking-tight tabular-nums">{value}</span>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>

        <div className="mt-1 flex items-center gap-2 text-xs">
          {hasDelta && (
            <span
              className={cn(
                "flex items-center gap-1 font-medium",
                good ? "text-emerald-500" : "text-rose-500",
              )}
            >
              {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {Math.abs(delta as number).toFixed(1)}%
            </span>
          )}
          {sub && <span className="text-muted-foreground">{sub}</span>}
        </div>

        {spark && (
          <div className="mt-auto pt-3">
            <Sparkline data={spark.data} dataKey={spark.dataKey} color={spark.color} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
