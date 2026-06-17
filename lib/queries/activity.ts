import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import { queryKeys } from "./keys";
import { rangeStartISO, type RangeKey } from "./ranges";

export type ActivitySummary = Tables<"activity_summaries">;

export function useActivitySummaries(range: RangeKey) {
  return useQuery({
    queryKey: queryKeys.activitySummaries(range),
    queryFn: async (): Promise<ActivitySummary[]> => {
      const supabase = createClient();
      let query = supabase
        .from("activity_summaries")
        .select("*")
        .order("date", { ascending: true });

      const since = rangeStartISO(range);
      if (since) query = query.gte("date", since);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}
