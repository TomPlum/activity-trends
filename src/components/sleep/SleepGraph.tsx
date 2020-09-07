import { Component } from 'react';
import moment from 'moment';
import { Card } from 'react-bootstrap';
import SleepQualityPieChart, { SleepQualityPieChartData } from "./SleepQualityPieChart";
import { ScatterChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, ZAxis, Tooltip, Legend, Scatter } from 'recharts';

interface SleepGraphMainProps {
    data: SleepGraphMainData[]
}

interface SleepGraphState {
    selectedSessionData: SleepQualityPieChartData;
    selectedSessionDate: string;
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

export interface SleepGraphMainData {
    date: string,
    duration: number,
    sleepQuality: number,
    isNap: boolean,
    awakeTime: number,
    lightSleep: number,
    deepSlight: number,
    remSleep: number
}

class SleepGraph extends Component<SleepGraphMainProps, SleepGraphState> {
    constructor(props) {
        super(props);
        this.state = {
            selectedSessionData: {
                awakeTime: 10,
                deepSleep: 40,
                lightSleep: 30,
                remSleep: 20
            } //TODO: Make latest record date
            , selectedSessionDate: this.getMostRecentDate()
        }
    }

    onClickScatter = (data) => {
        this.setState({
            selectedSessionData: {
                awakeTime: data.awakeTime,
                deepSleep: data.deepSleep,
                lightSleep: data.lightSleep,
                remSleep: data.remSleep
            },
            selectedSessionDate: data.date
        });
    }

    render() {
        return (
            <>
                <Card>
                    <Card.Body>
                        <Card.Title>Sleep Quality vs Time</Card.Title>
                        <ResponsiveContainer width="100%" height={350}>
                            <ScatterChart>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" name="Date" type="category" tickFormatter={this.xAxisFormatter} />
                                <YAxis dataKey="duration" name="Duration" type="number" unit=" hrs" domain={this.yAxisDomain()} />
                                <ZAxis dataKey="sleepQuality" range={[1, 100]} name="Sleep Quality" unit="%" />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                <Legend />
                                <Scatter
                                    name="Sleep Sessions"
                                    data={this.props.data}
                                    fill="#8884d8"
                                    onClick={this.onClickScatter}
                                />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </Card.Body>
                </Card>
                <Card>
                    <Card.Body>
                        <Card.Title>{this.state.selectedSessionDate}</Card.Title>
                        <SleepQualityPieChart
                            data={this.state.selectedSessionData}
                        />
                    </Card.Body>
                </Card>
            </>

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

    private getMostRecentSleepSession() {
        const data = this.props.data;
        const it = data.reduce((a, b) => {
            return new Date(a.date) > new Date(b.date) ? a : b;
        });
        console.log(it)
        return it;
    }

    private getMostRecentDate() {
        return new Date(Math.max(...this.props.data.map(e => new Date(e.date).getMilliseconds()))).toString();
    }
}

export default SleepGraph;