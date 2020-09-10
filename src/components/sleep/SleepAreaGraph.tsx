import { Component } from "react";
import { AreaChart, CartesianGrid, XAxis, Tooltip, Area, YAxis, Brush } from 'recharts';
import { SleepGraphMainData } from './SleepGraph';
import { Arrays } from '../../utility/Arrays';
import moment from "moment";
import AreaTooltip from "./AreaTooltip";
import styles from '../../../assets/sass/components/sleep/SleepAreaGraph.module.scss';
import GraphContainer from '../GraphContainer';

interface SleepAreaGraphProps {
    data: SleepGraphMainData[];
    onSelectedSession: (session) => void;
}

class SleepAreaGraph extends Component<SleepAreaGraphProps> {
    onClickArea = (selected) => {
        const payload = selected.payload;
        this.props.onSelectedSession({
            data: {
                awakeTime: payload.awakeTime,
                deepSleep: payload.deepSleep,
                lightSleep: payload.lightSleep,
                remSleep: payload.remSleep,
                sleepQuality: payload.sleepQuality,
                mood: payload.mood
            },
            date: payload.date,
            startTime: payload.startTime,
            endTime: payload.endTime,
            soundsRecorded: payload.soundsRecorded,
            duration: payload.duration,
            mood: payload.mood
        });
    }

    render() {
        return (
            <GraphContainer>
                <AreaChart data={this.props.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" name="Date" tickFormatter={this.xAxisFormatter} />
                    <YAxis type="number" name="Sleep Quality" unit="%" domain={this.yAxisDomain()} />
                    <Tooltip content={props => <AreaTooltip {...props}/>} />
                    <Area
                        type="monotone"
                        dataKey="sleepQuality"
                        stroke="#8884d8"
                        fill="#8884d8"
                        activeDot={{ onClick: this.onClickArea }}
                        animationDuration={2200}
                    />
                    <Brush
                        dataKey='date'
                        height={30}
                        stroke="#8884d8"
                        endIndex={this.getBrushEndIndex()}
                        tickFormatter={this.xAxisFormatter}
                    />
                </AreaChart>
            </GraphContainer>
        )
    }

    private yAxisDomain(): number[] {
        const data = this.props.data;
        const quality = data.map(e => e.sleepQuality);
        const minQuality = Math.floor(Arrays.min(quality));
        const maxQuality = Math.ceil(Arrays.max(quality));
        return [minQuality - 5, maxQuality];
    }

    private xAxisFormatter = (tickItem: string) => moment(tickItem).format("MMM YY")

    private getBrushEndIndex = () => Math.round(this.props.data.length / 10)
}

export default SleepAreaGraph;