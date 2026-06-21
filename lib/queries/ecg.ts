import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import { queryKeys } from "./keys";

export type Ecg = Tables<"ecg">;
export type EcgSummary = Omit<Ecg, "samples">;
/** A list row carries its full waveform so each row can render an inline preview. */
export type EcgListItem = EcgSummary & { samples: Ecg["samples"] };

/** ECG list — includes `samples` so each row can draw an inline waveform preview. */
export function useEcgList() {
  return useQuery({
    queryKey: queryKeys.ecgList,
    queryFn: async (): Promise<EcgListItem[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("ecg")
        .select(
          "id, recorded_at, classification, symptoms, sample_rate_hz, average_heart_rate, unit, sample_count, device, software_version, created_at, samples",
        )
        .order("recorded_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as EcgListItem[];
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
