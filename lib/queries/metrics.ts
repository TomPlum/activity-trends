import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import { queryKeys } from "./keys";
import { rangeStartISO, type RangeKey } from "./ranges";

export type DailyMetric = Tables<"daily_metrics">;

/** Daily rollups within a range, ordered chronologically — the workhorse for trend charts. */
export function useDailyMetrics(range: RangeKey) {
  return useQuery({
    queryKey: queryKeys.dailyMetrics(range),
    queryFn: async (): Promise<DailyMetric[]> => {
      const supabase = createClient();
      let query = supabase.from("daily_metrics").select("*").order("date", { ascending: true });

      const since = rangeStartISO(range);
      if (since) query = query.gte("date", since);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}
