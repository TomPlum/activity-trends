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
  routeName: string;
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

export interface WorkoutRouteResponse {
  route: WorkoutRouteData;
  creationDate: string;
  source: WorkoutRouteSource;
}

export interface WorkoutRouteData {
  points: WorkoutRoutePoint[];
}

export interface WorkoutRoutePoint {
  lat: number;
  long: number;
}

export interface WorkoutRouteSource {
  name: string;
  version: string;
}