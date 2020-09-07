import { Component } from "react";
import { ResponsiveContainer, CartesianGrid, ScatterChart, XAxis, YAxis, ZAxis, Tooltip, Legend, Scatter } from 'recharts';
import ScatterTooltip from "./ScatterTooltip";
import { SleepGraphMainData } from "./SleepGraph";
import moment from "moment";

interface SleepScatterGraphProps {
    data: SleepGraphMainData[];
    onSelectedSession: (session) => void;
}

class SleepScatterGraph extends Component<SleepScatterGraphProps> {
    onClickScatter = (data) => {
        this.props.onSelectedSession({
            data: {
                awakeTime: data.awakeTime,
                deepSleep: data.deepSleep,
                lightSleep: data.lightSleep,
                remSleep: data.remSleep,
                sleepQuality: data.sleepQuality
            },
            date: data.date
        });
    }
    
    render() {
        return (
            <ResponsiveContainer width="100%" height={350}>
                <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" name="Date" type="category" tickFormatter={this.xAxisFormatter} />
                    <YAxis dataKey="duration" name="Duration" type="number" unit=" hrs" domain={this.yAxisDomain()} />
                    <ZAxis dataKey="sleepQuality" range={[1, 100]} name="Sleep Quality" unit="%" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<ScatterTooltip />} />
                    <Legend />
                    <Scatter
                        name="Sleep Sessions"
                        data={this.props.data}
                        fill="#8884d8"
                        onClick={this.onClickScatter}
                        isAnimationActive={true}
                    />
                </ScatterChart>
            </ResponsiveContainer>
        );
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

export default SleepScatterGraph;