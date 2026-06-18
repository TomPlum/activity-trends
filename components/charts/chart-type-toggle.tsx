"use client";

import { AreaChart, BarChart3, LineChart, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChartType = "bar" | "line" | "area";

const OPTIONS: { type: ChartType; icon: LucideIcon; label: string }[] = [
  { type: "bar", icon: BarChart3, label: "Bar" },
  { type: "line", icon: LineChart, label: "Line" },
  { type: "area", icon: AreaChart, label: "Area" },
];

/** Reusable segmented control for switching a chart between bar/line/area. */
export function ChartTypeToggle({
  value,
  onChange,
  className,
}: {
  value: ChartType;
  onChange: (type: ChartType) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center rounded-md border p-0.5", className)}>
      {OPTIONS.map(({ type, icon: Icon, label }) => (
        <button
          key={type}
          type="button"
          aria-label={label}
          aria-pressed={value === type}
          title={label}
          onClick={() => onChange(type)}
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-[5px] text-muted-foreground transition-colors hover:text-foreground",
            value === type && "bg-muted text-foreground",
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
