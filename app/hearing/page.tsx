"use client";

import { useMemo, useState } from "react";
import { Ear, Headphones, Volume2, CalendarDays, TrendingUp, ShieldCheck } from "lucide-react";
import { useDailyMetrics, type DailyMetric } from "@/lib/queries/metrics";
import { PageHeader } from "@/components/dashboard/page-header";
import { RangeSelect } from "@/components/dashboard/range-select";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { StyleableTrendChart } from "@/components/charts/styleable-trend-chart";
import { ConfigurableTrendChart, type ChartMetric } from "@/components/charts/configurable-trend-chart";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { ChartHeader } from "@/components/dashboard/chart-header";
import { CardGridSkeleton, ChartSkeleton, QueryView } from "@/components/dashboard/states";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { RangeKey } from "@/lib/queries/ranges";
import * as fmt from "@/lib/format";
import { mean } from "@/lib/stats";
import { weekdayAverages } from "@/lib/activity";
import { EXPOSURE_BANDS, exposureRating, dbScalePosition } from "@/lib/health/hearing";
import { cn } from "@/lib/utils";

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
        {(m) => <HearingDashboard metrics={m} />}
      </QueryView>
    </>
  );
}

function HearingDashboard({ metrics }: { metrics: DailyMetric[] }) {
  const avgEnv = mean(metrics.map((d) => d.env_audio_db));
  const envBand = exposureRating(avgEnv);
  const hasHeadphone = metrics.some((d) => d.headphone_audio_db != null);

  const envValues = useMemo(
    () => metrics.map((d) => d.env_audio_db).filter((v): v is number => v != null),
    [metrics],
  );
  const peakEnv = envValues.length ? Math.max(...envValues) : null;
  const safeDays = envValues.filter((v) => v < 70).length;

  const envByDay = useMemo(
    () => weekdayAverages(metrics, "env_audio_db").map((w) => ({ day: w.day, db: w.value })),
    [metrics],
  );
  const headphoneByDay = useMemo(
    () => weekdayAverages(metrics, "headphone_audio_db").map((w) => ({ day: w.day, db: w.value })),
    [metrics],
  );

  const audioMetrics: ChartMetric[] = useMemo(() => {
    const fromKey = (key: keyof DailyMetric): Array<{ date: string; value: number | null }> =>
      metrics.map((d) => ({ date: String(d.date), value: (d[key] as number | null) ?? null }));
    const list: ChartMetric[] = [
      { key: "env_audio_db", label: "Environmental", unit: "dB", color: "var(--chart-2)", icon: Volume2, data: fromKey("env_audio_db"), valueFormatter: (v) => v.toFixed(0) },
    ];
    if (hasHeadphone)
      list.push({ key: "headphone_audio_db", label: "Headphone", unit: "dB", color: "var(--chart-3)", icon: Headphones, data: fromKey("headphone_audio_db"), valueFormatter: (v) => v.toFixed(0) });
    return list;
  }, [metrics, hasHeadphone]);

  const recent = useMemo(
    () => metrics.filter((d) => d.env_audio_db != null || d.headphone_audio_db != null),
    [metrics],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Environmental sound"
          value={fmt.number(avgEnv, 1)}
          unit="dB"
          icon={Volume2}
          accent="text-chart-2"
          spark={{ data: metrics, dataKey: "env_audio_db", color: "var(--chart-2)" }}
          sub={envBand ? <span className={envBand.accent}>{envBand.label}</span> : undefined}
        />
        <StatCard
          label="Headphone audio"
          value={fmt.number(mean(metrics.map((d) => d.headphone_audio_db)), 1)}
          unit="dB"
          icon={Headphones}
          accent="text-chart-3"
          spark={{ data: metrics, dataKey: "headphone_audio_db", color: "var(--chart-3)" }}
        />
        <StatCard
          label="Peak environmental"
          value={fmt.number(peakEnv, 1)}
          unit="dB"
          icon={TrendingUp}
          accent="text-chart-4"
        />
        <StatCard
          label="Quiet days"
          value={fmt.number(safeDays)}
          icon={ShieldCheck}
          accent="text-emerald-500"
          sub={`of ${envValues.length} days under 70 dB`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <ChartHeader
            icon={Ear}
            iconClass="text-chart-2"
            title="Exposure level"
            description={envBand ? `Average is ${envBand.label.toLowerCase()}` : "No exposure data"}
            info="Where your average environmental sound exposure sits against public-health guidance. The WHO suggests sustained exposure below ~70 dB; NIOSH treats 85 dB as the level above which prolonged exposure risks hearing loss."
          />
          <CardContent>
            {avgEnv != null ? (
              <ExposureClassification db={avgEnv} />
            ) : (
              <div className="flex h-[200px] items-center justify-center text-center text-sm text-muted-foreground">
                No environmental sound data in this range.
              </div>
            )}
          </CardContent>
        </Card>

        <AudioExposureChart data={metrics} hasHeadphone={hasHeadphone} />
      </div>

      <div className={cn("grid gap-6", hasHeadphone ? "lg:grid-cols-2" : "")}>
        <Card>
          <ChartHeader
            icon={CalendarDays}
            iconClass="text-chart-2"
            title="Environmental by day of week"
            description="Average level per weekday"
            info="Average environmental sound exposure grouped by the day of the week. Louder weekdays or weekends can point to commutes, workplaces or social settings worth being mindful of."
          />
          <CardContent>
            <TrendChart
              data={envByDay}
              xKey="day"
              height={260}
              valueFormatter={(v) => `${v.toFixed(0)}`}
              series={[{ key: "db", label: "Avg dB", type: "bar", color: "var(--chart-2)" }]}
            />
          </CardContent>
        </Card>
        {hasHeadphone && (
          <Card>
            <ChartHeader
              icon={CalendarDays}
              iconClass="text-chart-3"
              title="Headphone by day of week"
              description="Average level per weekday"
              info="Average headphone audio level grouped by the day of the week — handy for spotting the days you tend to listen loudest."
            />
            <CardContent>
              <TrendChart
                data={headphoneByDay}
                xKey="day"
                height={260}
                valueFormatter={(v) => `${v.toFixed(0)}`}
                series={[{ key: "db", label: "Avg dB", type: "bar", color: "var(--chart-3)" }]}
              />
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Audio exposure</CardTitle>
        </CardHeader>
        <CardContent>
          <ConfigurableTrendChart
            metrics={audioMetrics}
            defaultType="line"
            height={280}
            info="Chart environmental or headphone exposure over the range and toggle between line, bar and area views. Sustained levels matter more than brief peaks."
          />
        </CardContent>
      </Card>

      <RecentDays metrics={recent} />
    </div>
  );
}

function ExposureClassification({ db }: { db: number }) {
  const band = exposureRating(db);
  const pos = dbScalePosition(db);
  const tint: Record<string, string> = {
    safe: "bg-emerald-500/40",
    elevated: "bg-amber-500/40",
    high: "bg-rose-500/40",
  };
  const segs = EXPOSURE_BANDS.map((b, i) => {
    const start = i === 0 ? 0 : dbScalePosition(b.min);
    const end = b.max === Infinity ? 100 : dbScalePosition(b.max);
    return { ...b, width: end - start };
  });

  return (
    <div className="space-y-5">
      <div className="flex items-end gap-2">
        <span className="text-4xl font-semibold tabular-nums leading-none">{db.toFixed(0)}</span>
        <span className="pb-1 text-sm text-muted-foreground">dB</span>
        {band && <span className={cn("pb-1 text-sm font-medium", band.accent)}>{band.label}</span>}
      </div>
      <div className="relative pt-4">
        <div className="flex h-3 w-full overflow-hidden rounded-full">
          {segs.map((s) => (
            <div key={s.key} className={tint[s.key]} style={{ width: `${s.width}%` }} />
          ))}
        </div>
        <div
          className="absolute top-2.5 h-4 w-0.5 -translate-x-1/2 rounded-full bg-foreground"
          style={{ left: `${pos}%` }}
        />
      </div>
      <ul className="space-y-1.5 text-xs">
        {EXPOSURE_BANDS.map((b) => (
          <li key={b.key} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <span className={cn("h-2 w-2 rounded-full", tint[b.key])} />
              <span className={band?.key === b.key ? cn("font-medium", b.accent) : "text-muted-foreground"}>
                {b.label}
              </span>
            </span>
            <span className="tabular-nums text-muted-foreground">
              {b.max === Infinity ? `${b.min} dB+` : `${b.min}–${b.max} dB`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AudioExposureChart({ data, hasHeadphone }: { data: DailyMetric[]; hasHeadphone: boolean }) {
  return (
    <StyleableTrendChart
      className="lg:col-span-2"
      title={
        <>
          <Ear className="h-4 w-4 text-chart-2" /> Audio exposure
        </>
      }
      data={data}
      defaultType="line"
      series={[
        { key: "env_audio_db", label: "Environmental (dB)", color: "var(--chart-2)" },
        ...(hasHeadphone
          ? [{ key: "headphone_audio_db", label: "Headphone (dB)", color: "var(--chart-3)" }]
          : []),
      ]}
      valueFormatter={(v) => `${v.toFixed(0)}`}
      info="Average daily sound levels in decibels — environmental noise around you and audio played through headphones. Sustained high levels raise the risk of long-term hearing loss."
      footer={
        <p className="mt-3 text-xs text-muted-foreground">
          The WHO suggests keeping sustained exposure below ~70 dB to protect long-term hearing.
        </p>
      }
    />
  );
}

function RecentDays({ metrics }: { metrics: DailyMetric[] }) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const ordered = useMemo(() => metrics.slice().reverse(), [metrics]);
  const total = ordered.length;
  const rows = ordered.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">Recent days</CardTitle>
        <CardDescription>Every day with audio readings in this range</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-6 py-2 font-medium">Day</th>
                <th className="px-3 py-2 text-right font-medium">Environmental</th>
                <th className="px-6 py-2 text-right font-medium">Headphone</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={String(d.date)} className="border-b last:border-0 hover:bg-accent/40">
                  <td className="whitespace-nowrap px-6 py-2.5 font-medium">{fmt.shortDate(d.date)}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">
                    {d.env_audio_db != null ? `${fmt.number(d.env_audio_db, 1)} dB` : "—"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-2.5 text-right tabular-nums">
                    {d.headphone_audio_db != null ? `${fmt.number(d.headphone_audio_db, 1)} dB` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(0);
          }}
        />
      </CardContent>
    </Card>
  );
}
