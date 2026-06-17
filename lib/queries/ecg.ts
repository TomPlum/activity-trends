import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import { queryKeys } from "./keys";

export type Ecg = Tables<"ecg">;
export type EcgSummary = Omit<Ecg, "samples">;

/** ECG list — metadata only (excludes the heavy `samples` waveform). */
export function useEcgList() {
  return useQuery({
    queryKey: queryKeys.ecgList,
    queryFn: async (): Promise<EcgSummary[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("ecg")
        .select(
          "id, recorded_at, classification, symptoms, sample_rate_hz, average_heart_rate, unit, sample_count, device, software_version, created_at",
        )
        .order("recorded_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as EcgSummary[];
    },
  });
}

export function useEcg(id: string) {
  return useQuery({
    queryKey: queryKeys.ecg(id),
    enabled: !!id,
    queryFn: async (): Promise<Ecg | null> => {
      const supabase = createClient();
      const { data, error } = await supabase.from("ecg").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
