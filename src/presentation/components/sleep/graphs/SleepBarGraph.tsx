import React, { Component } from "react";
import { SleepGraphMainData } from "./SleepGraph";
import GraphContainer from "../../GraphContainer";
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Brush } from 'recharts';
import moment from "moment";
import BarTooltip from "../tooltips/BarTooltip";

interface SleepBarGraphProps {
    data: SleepGraphMainData[];
    onSelectedSession: (session) => void;
}

class SleepBarGraph extends Component<SleepBarGraphProps> {
    onClickBar = (selected) => {
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
                <BarChart data={this.props.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" name="Date" tickFormatter={this.xAxisFormatter} />
                    <YAxis unit="%" name="Sleep Quality" width={32}/>
                    <Tooltip content={(props) => <BarTooltip {...props} />} />
                    <Brush
                        dataKey='date'
                        height={30}
                        stroke="#8884d8"
                        endIndex={this.getBrushEndIndex()}
                        tickFormatter={this.xAxisFormatter}
                    />
                    <Bar
                        dataKey="sleepQuality"
                        fill="rgba(136, 132, 216, 0.6)"
                        stroke="#8884d8"
                        onClick={this.onClickBar}
                        animationDuration={2200}
                    />
                </BarChart>
            </GraphContainer>
        );
    }

    private xAxisFormatter = (tickItem: string) => moment(tickItem).format("MMM YY")

    private getBrushEndIndex = () => Math.round(this.props.data.length / 20)
}

export default SleepBarGraph;