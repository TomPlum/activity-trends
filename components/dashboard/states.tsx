import type { ReactNode } from "react";
import { AlertTriangle, Database, Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}

export function ChartSkeleton({ className = "h-[320px]" }: { className?: string }) {
  return <Skeleton className={`w-full rounded-xl ${className}`} />;
}

function Notice({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-14 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </div>
        <div>
          <p className="font-medium">{title}</p>
          {description && (
            <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function EmptyState({
  title = "No data yet",
  description = "Run the ingest script against your Apple Health export to populate this view.",
}: {
  title?: string;
  description?: string;
}) {
  return <Notice icon={<Inbox className="h-6 w-6" />} title={title} description={description} />;
}

export function ErrorState({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "Something went wrong.";
  const isConfig = /supabase|fetch|url|key|network/i.test(message);
  return (
    <Notice
      icon={isConfig ? <Database className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
      title={isConfig ? "Can’t reach Supabase" : "Failed to load"}
      description={
        isConfig
          ? "Check NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local and that data has been ingested."
          : message
      }
    />
  );
}

/** Renders the right state for a React Query result, or the children with data. */
export function QueryView<T>({
  query,
  loading,
  isEmpty,
  children,
}: {
  query: { isPending: boolean; isError: boolean; error: unknown; data: T | undefined };
  loading: ReactNode;
  isEmpty?: (data: T) => boolean;
  children: (data: T) => ReactNode;
}) {
  if (query.isPending) return <>{loading}</>;
  if (query.isError) return <ErrorState error={query.error} />;
  const data = query.data as T;
  if (isEmpty?.(data)) return <EmptyState />;
  return <>{children(data)}</>;
}
