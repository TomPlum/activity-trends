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
  meta: WorkoutSessionMetaData;
}

export interface WorkoutSessionMetaData {
  timeZone?: string;
  temperature?: WorkoutSessionTemperatureData;
}

export interface WorkoutSessionTemperatureData {
  value: number;
  unit: string;
  humidity: number;
}