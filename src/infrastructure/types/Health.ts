export interface WorkoutSessionResponse {
  sessions: WorkoutSessionData[];
}

export interface WorkoutSessionData {
  type: string;
  duration: string;
  distance: string;
  energyBurned: string;
  startTime: string;
  endTime: string;
}