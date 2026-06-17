"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, HeartPulse } from "lucide-react";
import { useEcg } from "@/lib/queries/ecg";
import { PageHeader } from "@/components/dashboard/page-header";
import { EcgWaveform } from "@/components/charts/ecg-waveform";
import { ChartSkeleton, ErrorState } from "@/components/dashboard/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import * as fmt from "@/lib/format";

export default function EcgDetailPage() {
  const params = useParams<{ id: string }>();
  const query = useEcg(params.id);

  if (query.isError) return <ErrorState error={query.error} />;

  const ecg = query.data;
  const samples = (ecg?.samples as number[] | undefined) ?? [];
  const duration = ecg?.sample_rate_hz ? ecg.sample_count / ecg.sample_rate_hz : null;

  return (
    <>
      <Link
        href="/heart"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Heart &amp; Vitals
      </Link>

      {query.isPending || !ecg ? (
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <ChartSkeleton className="h-[240px]" />
        </div>
      ) : (
        <>
          <PageHeader
            title="ECG recording"
            description={`${fmt.shortDate(ecg.recorded_at)} · ${fmt.timeOfDay(ecg.recorded_at)}`}
            actions={ecg.classification ? <Badge variant="secondary">{ecg.classification}</Badge> : undefined}
          />

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <HeartPulse className="h-4 w-4 text-chart-4" /> Lead I
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EcgWaveform samples={samples} />
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <Meta label="Classification" value={ecg.classification ?? "—"} />
                <Meta label="Duration" value={duration ? `${duration.toFixed(0)} s` : "—"} />
                <Meta label="Sample rate" value={ecg.sample_rate_hz ? `${fmt.number(ecg.sample_rate_hz)} Hz` : "—"} />
                <Meta label="Device" value={ecg.device ?? "—"} />
              </div>
              {ecg.symptoms && (
                <p className="mt-3 text-sm text-muted-foreground">Symptoms: {ecg.symptoms}</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}
