import { Component } from "react";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, Tooltip, Area, YAxis } from 'recharts';
import { SleepGraphMainData } from './SleepGraph';
import { Arrays } from '../../utility/Arrays';
import moment from "moment";

interface SleepAreaGraphProps {
    data: SleepGraphMainData[];
}

class SleepAreaGraph extends Component<SleepAreaGraphProps> {
    render() {
        return (
            <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={this.props.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={this.xAxisFormatter} />
                    <YAxis type="number" unit="%" domain={this.yAxisDomain()}/>
                    <Tooltip />
                    <Area type="monotone" dataKey="sleepQuality" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
            </ResponsiveContainer>
        )
    }

    private yAxisDomain(): number[] {
        const data = this.props.data;
        const quality = data.map(e => e.sleepQuality);
        const minQuality = Math.floor(Arrays.min(quality));
        const maxQuality = Math.ceil(Arrays.max(quality));
        return [minQuality, maxQuality];
    }

    private xAxisFormatter(tickItem: string) {
        return moment(tickItem).format("MMM YY")
    }
}

export default SleepAreaGraph;