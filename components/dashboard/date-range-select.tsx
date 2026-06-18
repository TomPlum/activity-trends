"use client";

import { CalendarDays } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RANGE_OPTIONS, type RangeKey } from "@/lib/queries/ranges";
import { cn } from "@/lib/utils";

export interface CustomRange {
  /** yyyy-MM-dd */
  from: string;
  /** yyyy-MM-dd */
  to: string;
}

export function isCustomRangeActive(custom: CustomRange | null): boolean {
  return !!custom && (custom.from !== "" || custom.to !== "");
}

function fmtDay(iso: string): string {
  try {
    return format(parseISO(iso), "d MMM yyyy");
  } catch {
    return iso;
  }
}

/**
 * Date range control: preset windows (7d/30d/…/all) plus a custom from–to
 * picker. When a custom range is active it takes precedence over the preset.
 */
export function DateRangeSelect({
  range,
  onRangeChange,
  custom,
  onCustomChange,
}: {
  range: RangeKey;
  onRangeChange: (range: RangeKey) => void;
  custom: CustomRange | null;
  onCustomChange: (custom: CustomRange | null) => void;
}) {
  const isCustom = isCustomRangeActive(custom);
  const label = isCustom
    ? `${custom!.from ? fmtDay(custom!.from) : "…"} – ${custom!.to ? fmtDay(custom!.to) : "…"}`
    : (RANGE_OPTIONS.find((o) => o.value === range)?.label ?? "Range");

  const draft = custom ?? { from: "", to: "" };
  const setDraft = (next: CustomRange) =>
    onCustomChange(next.from === "" && next.to === "" ? null : next);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("gap-2", isCustom && "border-workout text-workout")}>
          <CalendarDays className="h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-3" align="end">
        <div className="grid grid-cols-3 gap-1.5">
          {RANGE_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={!isCustom && range === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => {
                onCustomChange(null);
                onRangeChange(opt.value);
              }}
            >
              {opt.label}
            </Button>
          ))}
        </div>

        <div className="border-t pt-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Custom range</p>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={draft.from}
              max={draft.to || undefined}
              onChange={(e) => setDraft({ ...draft, from: e.target.value })}
              className="h-8 w-full rounded-md border bg-background px-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
            <span className="text-muted-foreground">–</span>
            <input
              type="date"
              value={draft.to}
              min={draft.from || undefined}
              onChange={(e) => setDraft({ ...draft, to: e.target.value })}
              className="h-8 w-full rounded-md border bg-background px-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>
          {isCustom && (
            <Button
              variant="ghost"
              size="xs"
              className="mt-2 w-full"
              onClick={() => onCustomChange(null)}
            >
              Clear custom range
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
