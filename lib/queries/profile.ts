import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import { queryKeys } from "./keys";

export type Profile = Tables<"profile">;

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: async (): Promise<Profile | null> => {
      const supabase = createClient();
      const { data, error } = await supabase.from("profile").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
