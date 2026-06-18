"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface NumberRange {
  min: string;
  max: string;
}

export const EMPTY_RANGE: NumberRange = { min: "", max: "" };

export function isRangeActive(range: NumberRange): boolean {
  return range.min.trim() !== "" || range.max.trim() !== "";
}

/** Returns true when `value` falls inside the (optional) min/max bounds. */
export function matchesRange(value: number | null | undefined, range: NumberRange): boolean {
  const min = range.min.trim() === "" ? null : Number(range.min);
  const max = range.max.trim() === "" ? null : Number(range.max);
  if (min == null && max == null) return true;
  if (value == null || Number.isNaN(value)) return false;
  if (min != null && value < min) return false;
  if (max != null && value > max) return false;
  return true;
}

/** A reusable popover with min/max inputs for filtering a numeric column. */
export function NumberRangeFilter({
  label,
  unit,
  value,
  onChange,
}: {
  label: string;
  unit?: string;
  value: NumberRange;
  onChange: (range: NumberRange) => void;
}) {
  const active = isRangeActive(value);
  const summary = active
    ? `${value.min || "0"}–${value.max || "∞"}`
    : null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-1.5", active && "border-workout text-workout")}
        >
          {label}
          {summary && <span className="tabular-nums">{summary}</span>}
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 space-y-3" align="start">
        <p className="text-xs font-medium text-muted-foreground">
          {label}
          {unit ? ` (${unit})` : ""}
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            placeholder="Min"
            value={value.min}
            onChange={(e) => onChange({ ...value, min: e.target.value })}
            className="h-8 w-full rounded-md border bg-background px-2 text-sm tabular-nums outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="Max"
            value={value.max}
            onChange={(e) => onChange({ ...value, max: e.target.value })}
            className="h-8 w-full rounded-md border bg-background px-2 text-sm tabular-nums outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
        {active && (
          <Button
            variant="ghost"
            size="xs"
            className="w-full"
            onClick={() => onChange(EMPTY_RANGE)}
          >
            Clear
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
