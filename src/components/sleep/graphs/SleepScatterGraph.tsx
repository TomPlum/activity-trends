import { Component } from "react";
import { CartesianGrid, ScatterChart, XAxis, YAxis, ZAxis, Tooltip, Scatter, Brush } from 'recharts';
import ScatterTooltip from "../tooltips/ScatterTooltip";
import { SleepGraphMainData } from "./SleepGraph";
import { Arrays } from '../../../utility/Arrays';
import moment from "moment";
import GraphContainer from "../../GraphContainer";

interface SleepScatterGraphProps {
    data: SleepGraphMainData[];
    onSelectedSession: (session) => void;
}

interface SleepScatterGraphState {
    brushStartIndex: string;
    brushEndIndex: string;
}

class SleepScatterGraph extends Component<SleepScatterGraphProps, SleepScatterGraphState> {
    constructor(props) {
        super(props);
        this.state = {
            brushStartIndex: this.getEarliestDate(),
            brushEndIndex: this.getBrushEndIndex()
        }
    }

    onClickScatter = (selected) => {
        this.props.onSelectedSession({
            data: {
                awakeTime: selected.awakeTime,
                deepSleep: selected.deepSleep,
                lightSleep: selected.lightSleep,
                remSleep: selected.remSleep,
                sleepQuality: selected.sleepQuality,
            },
            date: selected.date,
            startTime: selected.startTime,
            endTime: selected.endTime,
            duration: selected.duration,
            soundsRecorded: selected.soundsRecorded,
            mood: selected.mood
        });
    }
    
    render() {
        return (
            <GraphContainer>
                <ScatterChart data={this.props.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" name="Date" type="category" tickFormatter={this.xAxisFormatter} />
                    <YAxis dataKey="duration" name="Duration" type="number" unit=" hrs" domain={this.yAxisDomain()} />
                    <ZAxis dataKey="sleepQuality" range={[1, 300]} name="Sleep Quality" unit="%" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={props => <ScatterTooltip {...props} />} />
                    <Brush
                        dataKey='date'
                        height={30}
                        stroke="#8884d8"
                        tickFormatter={this.xAxisFormatter}
                        endIndex={this.getBrushFilteredData().length}
                        onChange={({ brushStartIndex, brushEndIndex }) => this.setState({ brushStartIndex, brushEndIndex })}
                    />
                    <Scatter
                        name="Sleep Sessions"
                        data={this.getBrushFilteredData()}
                        fill="rgba(136, 132, 216, 0.7)"
                        onClick={this.onClickScatter}
                        isAnimationActive={true}
                    />
                </ScatterChart>
            </GraphContainer>
        );
    }

    private getBrushFilteredData() {
        const { brushStartIndex, brushEndIndex } = this.state;
        return this.props.data.filter(datum => new Date(datum.date) >= new Date(brushStartIndex) && new Date(datum.date) <= new Date(brushEndIndex));
    }

    private getEarliestDate = () => this.props.data[0].date;
    
    private getBrushEndIndex() {
        const { data } = this.props;
        return data[Math.round(data.length / 5)].date;
    }

    private yAxisDomain(): number[] {
        const data = this.props.data;
        const durations = data.map(e => e.duration);
        const minDuration = Math.floor(Arrays.min(durations));
        const maxDuration = Math.ceil(Arrays.max(durations));
        return [minDuration, maxDuration];
    }

    private xAxisFormatter(tickItem: string) {
        return moment(tickItem).format("MMM YY")
    }
}

export default SleepScatterGraph;