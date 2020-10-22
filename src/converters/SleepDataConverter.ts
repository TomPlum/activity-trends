import { SleepGraphMainData } from "../components/sleep/graphs/SleepGraph";
import { Mood } from "../domain/Mood";
import moment from "moment";

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
                isNap: row["Nap"] === "YES",
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
        const graphData = data.map(e => {
            const startDate = e.startDate.slice(0, -6);
            const endDate = e.endDate.slice(0, -6);
            return {
                date: startDate,
                startTime: moment(startDate).format("HH:mm"),
                endTime: moment(endDate).format("HH:mm"),
                duration: e.duration / 60,
                sleepQuality: e.sleepQuality,
                isNap: e.isNap,
                awakeTime: e.awakeTime / 60,
                remSleep: e.remSleep / 60,
                lightSleep: e.lightSleep / 60,
                deepSleep: e.deepSleep / 60,
                soundsRecorded: e.soundsRecorded,
                mood: e.mood as Mood
            }
        });

        return this.filterInvalidData(graphData);
    }

    convertInitialiseResponseData(data: any): SleepGraphMainData[] {
        return this.convertSnapshot(data.latestSnapshot).filter(e => e.duration > 3 && e.duration < 12 && !e.isNap && e.sleepQuality > 0);
    }

    convertSnapshotData(data: any): SleepGraphMainData[] {
        const graphData = this.convertSnapshot(data);
        return this.filterInvalidData(graphData);
    }

    private filterInvalidData(data: SleepGraphMainData[]): SleepGraphMainData[] {
        return data.filter(e => e.duration > 3 && e.duration < 12 && !e.isNap && e.sleepQuality > 0);
    }

    private convertSnapshot(data: any) {
        return data.sessions.map( e => {
            const startDate = e.startDate.slice(0, -6);
            const endDate = e.endDate.slice(0, -6);
            const time = e.time;
            return {
                date: startDate,
                startTime: moment(startDate).format("HH:mm"),
                endTime: moment(endDate).format("HH:mm"),
                duration: e.duration / 60,
                sleepQuality: e.quality,
                isNap: e.nap,
                awakeTime: time.awake / 60,
                remSleep: time.rem / 60,
                lightSleep: time.light / 60,
                deepSleep: time.deep / 60,
                soundsRecorded: e.soundsRecorded,
                mood: e.mood as Mood
            }
        });
    }
}

export default SleepDataConverter;