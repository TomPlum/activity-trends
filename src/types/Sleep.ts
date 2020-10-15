export interface SleepInitialiseData {
    snapshotDates: string[],
    latestSnapshot: SleepSnapshot;
}

export interface SleepSnapshot {
    date: string;
    sessions: SleepSession[];
}

export interface SleepSession {
    startDate: string;
    endDate: string;
    duration: number;
    quality: number;
    time: SleepTime;
    soundsRecorded: number;
    mood: string;
    nap: boolean;
}

export interface SleepTime {
    awake: number;
    light: number;
    deep: number;
    rem: number;
}