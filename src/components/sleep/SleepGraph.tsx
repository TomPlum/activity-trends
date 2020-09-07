import { Component } from 'react';
import moment from 'moment';
import { Card, Col } from 'react-bootstrap';
import SleepQualityPieChart, { SleepQualityPieChartData } from "./SleepQualityPieChart";
import { ScatterChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, ZAxis, Tooltip, Legend, Scatter } from 'recharts';
import ScatterTooltip from './ScatterTooltip';

interface SleepGraphMainProps {
    data: SleepGraphMainData[]
}

interface SleepGraphState {
    selectedSessionData: SleepQualityPieChartData;
    selectedSessionDate: string;
}

export interface SleepGraphMainData {
    date: string,
    duration: number,
    sleepQuality: number,
    isNap: boolean,
    awakeTime: number,
    lightSleep: number,
    deepSleep: number,
    remSleep: number
}

class SleepGraph extends Component<SleepGraphMainProps, SleepGraphState> {
    constructor(props) {
        super(props);
        this.state = {
            selectedSessionData: this.getMostRecentSleepSession(),
            selectedSessionDate: this.getMostRecentDate()
        }
    }

    onClickScatter = (data) => {
        this.setState({
            selectedSessionData: {
                awakeTime: data.awakeTime,
                deepSleep: data.deepSleep,
                lightSleep: data.lightSleep,
                remSleep: data.remSleep,
                sleepQuality: data.sleepQuality
            },
            selectedSessionDate: data.date
        });
    }

    render() {
        return (
            <>
                <Card>
                    <Card.Body>
                        <Card.Title>Sleep Quality vs Duration over Time</Card.Title>
                        <ResponsiveContainer width="100%" height={350}>
                            <ScatterChart>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" name="Date" type="category" tickFormatter={this.xAxisFormatter} />
                                <YAxis dataKey="duration" name="Duration" type="number" unit=" hrs" domain={this.yAxisDomain()} />
                                <ZAxis dataKey="sleepQuality" range={[1, 100]} name="Sleep Quality" unit="%" />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<ScatterTooltip/>} />
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
                    </Card.Body>
                </Card>
                <Card>
                    <Card.Body>
                        <Card.Title>{this.formatDateTitle()}</Card.Title>
                        <Col md={4}>
                            <SleepQualityPieChart
                                data={this.state.selectedSessionData}
                            />
                        </Col>

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

    private formatDateTitle() {
        return moment(this.state.selectedSessionDate).format("dddd Do MMMM YYYY")
    }

    private getMostRecentSleepSession() {
        const data = this.props.data;
        return data.find(d => d.date = this.getMostRecentDate());
    }

    private getMostRecentDate() {
        return moment.max(this.props.data.map(d => moment(d.date))).toString();
    }
}

export default SleepGraph;