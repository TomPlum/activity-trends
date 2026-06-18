"use client";

import { useMemo } from "react";
import { Lightbulb } from "lucide-react";
import { useDailyMetrics } from "@/lib/queries/metrics";
import { deriveInsights } from "@/lib/insights/engine";
import { PageHeader } from "@/components/dashboard/page-header";
import { InsightList } from "@/components/dashboard/insight-list";
import { ChartSkeleton, QueryView } from "@/components/dashboard/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InsightsPage() {
  const query = useDailyMetrics("1y");
  const insights = useMemo(() => deriveInsights(query.data ?? []), [query.data]);

  return (
    <>
      <PageHeader
        title="Insights"
        description="Patterns we found by correlating a year of your daily metrics — how sleep, training and habits move your recovery."
      />

      <QueryView query={query} loading={<ChartSkeleton className="h-[420px]" />}>
        {() => (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lightbulb className="h-4 w-4 text-chart-3" />
                  What your data is telling you
                </CardTitle>
              </CardHeader>
              <CardContent>
                <InsightList insights={insights} />
              </CardContent>
            </Card>

            <p className="px-1 text-xs text-muted-foreground">
              Insights are correlations across daily roll-ups, not medical advice. “r” is the
              Pearson correlation (−1 to 1); only relationships strong enough (|r| ≥ 0.2) and seen
              across enough days are shown. Correlation isn’t causation.
            </p>
          </div>
        )}
      </QueryView>
    </>
  );
}
