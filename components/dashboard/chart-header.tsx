import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoHint } from "@/components/dashboard/info-hint";

/**
 * A chart card header: title (with optional icon) + description on the left,
 * any controls plus an info icon pinned to the top-right. The info icon reveals
 * a tooltip explaining what the chart shows. Shared by every graph card.
 */
export function ChartHeader({
  icon: Icon,
  iconClass,
  title,
  description,
  info,
  actions,
}: {
  icon?: LucideIcon;
  iconClass?: string;
  title: string;
  description?: string;
  info: string;
  /** Optional controls (e.g. a chart-type toggle) shown left of the info icon. */
  actions?: ReactNode;
}) {
  return (
    <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
      <div className="space-y-1.5">
        <CardTitle className="flex items-center gap-2 text-base">
          {Icon && <Icon className={cn("h-4 w-4", iconClass)} />}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {actions}
        <InfoHint text={info} />
      </div>
    </CardHeader>
  );
}
