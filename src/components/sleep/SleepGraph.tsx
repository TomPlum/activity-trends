import { Component } from 'react';
import moment from 'moment';
import { ScatterChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, ZAxis, Tooltip, Legend, Scatter } from 'recharts';

interface SleepGraphProps {
    data: SleepGraphData[]
}

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

export interface SleepGraphData {
    date: string,
    duration: number,
    sleepQuality: number,
    isNap: boolean
}

class SleepGraph extends Component<SleepGraphProps> {
    render() {
        return (
            <ResponsiveContainer width="100%" height={350}>
                <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" name="Date" tickFormatter={this.xAxisFormatter} />
                    <YAxis dataKey="duration" name="Duration" type="number" unit=" hrs" domain={this.yAxisDomain()} />
                    <ZAxis dataKey="sleepQuality" range={[1, 100]} name="Sleep Quality" unit="%" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                    <Scatter name="Sleep Sessions" data={this.props.data} fill="#8884d8" />
                </ScatterChart>
            </ResponsiveContainer>
        )
    }

    private yAxisDomain(): number[] {
        const data = this.props.data;
        const durations = data.map(e => e.duration);
        const minDuration = Math.floor(this.arrayMin(durations));
        const maxDuration = Math.ceil(this.arrayMax(durations));
        return [minDuration, maxDuration];
    }

    private arrayMin(arr: number[]) {
        return arr.reduce((p, v) => (p < v ? p : v));
    }

    private arrayMax(arr: number[]) {
        return arr.reduce((p, v) => (p > v ? p : v));
    }

    private xAxisFormatter(tickItem: string) {
        return moment(tickItem).format("MMM YY")
    }
}

export default SleepGraph;