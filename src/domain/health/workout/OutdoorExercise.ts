import { WorkoutSession } from "./WorkoutSession";

export class OutdoorExercise {
  private readonly _sessions: WorkoutSession[]

  constructor(sessions: WorkoutSession[]) {
    this._sessions = sessions;
  }

  get sessions(): WorkoutSession[] {
    return this._sessions;
  }
}