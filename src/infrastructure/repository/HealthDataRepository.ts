import { WorkoutSessionData } from "../types/Health";
import RestClient from "../RestClient";

export class HealthDataRepository {
  async getRunningData(): Promise<WorkoutSessionData[]> {
    const response = await RestClient.get<WorkoutSessionData[]>('/workouts/sessions');

    if (response.errors && response.errors.length > 0) {
      throw new Error(response.errors[0].message);
    }

    if (response.data) {
      return response.data;
    }
  }
}