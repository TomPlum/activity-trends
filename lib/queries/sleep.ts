import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import { queryKeys } from "./keys";
import { rangeStartTimestamp, type RangeKey } from "./ranges";

export type SleepSession = Tables<"sleep_sessions">;

export function useSleepSessions(range: RangeKey) {
  return useQuery({
    queryKey: queryKeys.sleep(range),
    queryFn: async (): Promise<SleepSession[]> => {
      const supabase = createClient();
      let query = supabase
        .from("sleep_sessions")
        .select("*")
        .eq("is_nap", false)
        .order("start_time", { ascending: true });

      const since = rangeStartTimestamp(range);
      if (since) query = query.gte("start_time", since);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}
