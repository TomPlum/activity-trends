"use client";

import { useState } from "react";
import { Ear, Headphones, Volume2 } from "lucide-react";
import { useDailyMetrics } from "@/lib/queries/metrics";
import { PageHeader } from "@/components/dashboard/page-header";
import { RangeSelect } from "@/components/dashboard/range-select";
import { StatCard } from "@/components/dashboard/stat-card";
import { StyleableTrendChart } from "@/components/charts/styleable-trend-chart";
import { CardGridSkeleton, ChartSkeleton, QueryView } from "@/components/dashboard/states";
import type { RangeKey } from "@/lib/queries/ranges";
import * as fmt from "@/lib/format";
import { mean } from "@/lib/stats";

export default function HearingPage() {
  const [range, setRange] = useState<RangeKey>("90d");
  const query = useDailyMetrics(range);

  return (
    <>
      <PageHeader
        title="Hearing"
        description="Environmental and headphone audio exposure levels."
        actions={<RangeSelect value={range} onChange={setRange} />}
      />

      <QueryView
        query={query}
        loading={
          <div className="space-y-6">
            <CardGridSkeleton count={2} />
            <ChartSkeleton />
          </div>
        }
        isEmpty={(d) => d.every((r) => r.env_audio_db == null && r.headphone_audio_db == null)}
      >
        {(m) => (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard label="Environmental sound" value={fmt.number(mean(m.map((d) => d.env_audio_db)), 1)} unit="dB" icon={Volume2} accent="text-chart-2" spark={{ data: m, dataKey: "env_audio_db", color: "var(--chart-2)" }} />
              <StatCard label="Headphone audio" value={fmt.number(mean(m.map((d) => d.headphone_audio_db)), 1)} unit="dB" icon={Headphones} accent="text-chart-3" spark={{ data: m, dataKey: "headphone_audio_db", color: "var(--chart-3)" }} />
            </div>

            <StyleableTrendChart
              title={
                <>
                  <Ear className="h-4 w-4 text-chart-2" /> Audio exposure
                </>
              }
              data={m}
              defaultType="line"
              series={[
                { key: "env_audio_db", label: "Environmental (dB)", color: "var(--chart-2)" },
                { key: "headphone_audio_db", label: "Headphone (dB)", color: "var(--chart-3)" },
              ]}
              valueFormatter={(v) => `${v.toFixed(0)}`}
              info="Average daily sound levels in decibels — environmental noise around you and audio played through headphones. Sustained high levels raise the risk of long-term hearing loss."
              footer={
                <p className="mt-3 text-xs text-muted-foreground">
                  The WHO suggests keeping sustained exposure below ~70 dB to protect long-term
                  hearing.
                </p>
              }
            />
          </div>
        )}
      </QueryView>
    </>
  );
}
