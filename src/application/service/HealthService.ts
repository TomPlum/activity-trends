import { CardioSessions } from "../../domain/health/workout/CardioSessions";
import { HealthDataRepository } from "../../infrastructure/repository/HealthDataRepository";
import { WorkoutSessionConverter } from "../../infrastructure/converters/WorkoutSessionConverter";
import { isCardio } from "../../domain/health/workout/WorkoutType";

export class HealthService {
  private repository = new HealthDataRepository();
  private converter = new WorkoutSessionConverter();

  async getCardioSessions(): Promise<CardioSessions> {
    const data = await this.repository.getCardioSessions();
    const sessions = this.converter.convert(data.sessions);
    const cardio = sessions.filter(session => isCardio(session.type));
    return new CardioSessions(cardio);
  }
}