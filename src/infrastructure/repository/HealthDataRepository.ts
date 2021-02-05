import {WorkoutRouteResponse, WorkoutSessionResponse} from "../types/Health";
import RestClient from "../RestClient";

export class HealthDataRepository {
  async getCardioSessions(): Promise<WorkoutSessionResponse> {
    const response = await RestClient.get<WorkoutSessionResponse>("/workouts/sessions");

    if (response.errors && response.errors.length > 0) {
      throw new Error(response.errors[0].message);
    }

    if (response.data) {
      return response.data;
    }
  }

  async getWorkoutSessionRoute(name: string): Promise<WorkoutRouteResponse> {
    const response = await RestClient.get<WorkoutRouteResponse>("/workouts/route/" + name);

    if (response.errors && response.errors.length > 0) {
      throw new Error(response.errors[0].message);
    }

    if (response.data) {
      return response.data;
    }
  }
}