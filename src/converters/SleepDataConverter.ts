import { SleepGraphMainData } from "../components/sleep/SleepGraph";

export interface SleepData {
    startDate: string,
    endDate: string,
    duration: number,
    isNap: boolean,
    sleepQuality: number,
    awakeTime: number,
    remSleep: number,
    lightSleep: number,
    deepSleep: number,
    soundsRecorded: number,
    mood: string
}

class SleepDataConverter {
    convert(data: any[]): SleepData[] {
        return data.map(row => {
            return {
                startDate: row["Start Time"],
                endDate: row["End Time"],
                duration: Number(row["Duration (mins)"]),
                isNap: row["Nap"] == "YES",
                sleepQuality: Number(row["Sleep Quality (%)"]),
                awakeTime: Number(row["Time Awake (mins)"]),
                remSleep: Number(row["Time in REM Slep (mins)"]),
                lightSleep: Number(row["Time in Light Sleep (mins)"]),
                deepSleep: Number(row["Time In Deep Sleep (mins)"]),
                soundsRecorded: Number(row["Sounds Recorded"]),
                mood: row["Wake-up mood"]
            }
        });
    }

    convertToMainGraphData(data: SleepData[]): SleepGraphMainData[] {
        return data.map(e => {
            return {
                date: e.startDate.slice(0, -6),
                duration: e.duration / 60,
                sleepQuality: e.sleepQuality,
                isNap: e.isNap,
                awakeTime: e.awakeTime / 60,
                remSleep: e.remSleep / 60,
                lightSleep: e.lightSleep / 60,
                deepSleep: e.deepSleep / 60
            }
        }).filter(e => e.duration > 3 && e.duration < 12 && !e.isNap && e.sleepQuality > 0);
    }
}

export default SleepDataConverter;