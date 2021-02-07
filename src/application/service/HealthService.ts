import { CardioSessions } from "../../domain/health/workout/CardioSessions";
import { HealthDataRepository } from "../../infrastructure/repository/HealthDataRepository";
import { WorkoutSessionConverter } from "../../infrastructure/converters/WorkoutSessionConverter";
import { isCardio } from "../../domain/health/workout/WorkoutType";
import { CardioRoute } from "../../domain/health/workout/CardioRoute";
import { CardioRouteConverter } from "../../infrastructure/converters/CardioRouteConverter";

export class HealthService {
  private repository = new HealthDataRepository();

  async getCardioSessions(): Promise<CardioSessions> {
    const data = await this.repository.getCardioSessions();
    const sessions = new WorkoutSessionConverter().convert(data.sessions);
    const cardio = sessions.filter(session => isCardio(session.type));
    return new CardioSessions(cardio);
  }

  async getCardioRoute(routeName: string): Promise<CardioRoute> {
    const data = await this.repository.getWorkoutSessionRoute(routeName);
    return new CardioRouteConverter().convert(data);
  }
}