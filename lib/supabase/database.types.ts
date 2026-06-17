// Hand-authored to mirror supabase/migrations. Regenerate from a live project
// with `npm run db:types` (requires the Supabase CLI + a running/linked DB).

type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profile: {
        Row: {
          id: number;
          date_of_birth: string | null;
          biological_sex: string | null;
          blood_type: string | null;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profile"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["profile"]["Row"]>;
        Relationships: [];
      };
      workouts: {
        Row: {
          id: string;
          activity_type: string;
          start_time: string;
          end_time: string | null;
          duration_min: number | null;
          distance_km: number | null;
          energy_kcal: number | null;
          avg_heart_rate: number | null;
          max_heart_rate: number | null;
          temperature_c: number | null;
          humidity: number | null;
          timezone: string | null;
          source: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["workouts"]["Row"]> & {
          activity_type: string;
          start_time: string;
        };
        Update: Partial<Database["public"]["Tables"]["workouts"]["Row"]>;
        Relationships: [];
      };
      workout_routes: {
        Row: {
          id: string;
          workout_id: string | null;
          source: string | null;
          created_date: string | null;
          point_count: number;
          distance_km: number | null;
          bounds: Json | null;
          points: Json;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["workout_routes"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["workout_routes"]["Row"]>;
        Relationships: [];
      };
      activity_summaries: {
        Row: {
          date: string;
          active_energy_kcal: number | null;
          active_energy_goal: number | null;
          exercise_min: number | null;
          exercise_goal: number | null;
          stand_hours: number | null;
          stand_goal: number | null;
        };
        Insert: Partial<Database["public"]["Tables"]["activity_summaries"]["Row"]> & {
          date: string;
        };
        Update: Partial<Database["public"]["Tables"]["activity_summaries"]["Row"]>;
        Relationships: [];
      };
      sleep_sessions: {
        Row: {
          id: string;
          start_time: string;
          end_time: string | null;
          duration_min: number | null;
          quality_pct: number | null;
          awake_min: number | null;
          rem_min: number | null;
          light_min: number | null;
          deep_min: number | null;
          sounds_recorded: number | null;
          mood: string | null;
          is_nap: boolean;
          source: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["sleep_sessions"]["Row"]> & {
          start_time: string;
        };
        Update: Partial<Database["public"]["Tables"]["sleep_sessions"]["Row"]>;
        Relationships: [];
      };
      health_records: {
        Row: {
          id: number;
          type: string;
          unit: string | null;
          value: number | null;
          start_time: string;
          end_time: string | null;
          source: string | null;
        };
        Insert: {
          type: string;
          start_time: string;
          unit?: string | null;
          value?: number | null;
          end_time?: string | null;
          source?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["health_records"]["Row"]>;
        Relationships: [];
      };
      daily_metrics: {
        Row: {
          date: string;
          steps: number | null;
          distance_km: number | null;
          flights_climbed: number | null;
          active_energy: number | null;
          exercise_min: number | null;
          resting_hr: number | null;
          avg_heart_rate: number | null;
          hrv_ms: number | null;
          vo2max: number | null;
          blood_oxygen: number | null;
          respiratory_rate: number | null;
          weight_kg: number | null;
          bmi: number | null;
          body_fat_pct: number | null;
          sleep_min: number | null;
          sleep_quality: number | null;
          stand_hours: number | null;
          basal_energy: number | null;
          physical_effort: number | null;
          daylight_min: number | null;
          distance_cycling_km: number | null;
          walking_hr_avg: number | null;
          sleeping_wrist_temp_c: number | null;
          walking_speed_kmh: number | null;
          step_length_cm: number | null;
          walking_asymmetry_pct: number | null;
          double_support_pct: number | null;
          stair_ascent_speed: number | null;
          stair_descent_speed: number | null;
          walking_steadiness_pct: number | null;
          env_audio_db: number | null;
          headphone_audio_db: number | null;
          diet_energy_kcal: number | null;
          carbs_g: number | null;
          protein_g: number | null;
          fat_g: number | null;
          sugar_g: number | null;
          fiber_g: number | null;
          sodium_mg: number | null;
          water_ml: number | null;
          caffeine_mg: number | null;
        };
        Insert: Partial<Database["public"]["Tables"]["daily_metrics"]["Row"]> & {
          date: string;
        };
        Update: Partial<Database["public"]["Tables"]["daily_metrics"]["Row"]>;
        Relationships: [];
      };
      ecg: {
        Row: {
          id: string;
          recorded_at: string;
          classification: string | null;
          symptoms: string | null;
          sample_rate_hz: number | null;
          average_heart_rate: number | null;
          unit: string | null;
          sample_count: number;
          device: string | null;
          software_version: string | null;
          samples: Json;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["ecg"]["Row"]> & {
          recorded_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["ecg"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      refresh_daily_metrics: {
        Args: { tz?: string };
        Returns: undefined;
      };
      reset_health_data: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
