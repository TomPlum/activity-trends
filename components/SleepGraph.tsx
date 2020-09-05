import { Component } from 'react';
import {  Card } from 'react-bootstrap';
import moment from 'moment';
import { ScatterChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, ZAxis, Tooltip, Legend, Scatter } from 'recharts';

interface SleepGraphProps {
    data: SleepData[]
}

export interface SleepData {
    'Start Time': Date,
    'End Time': Date,
    'Duration (mins)': number,
    'Nap': string,
    'Sleep Quality (%)': string,
    'Time Awake (mins)': string,
    'Time in REM Slep (mins)': string,
    'Time in Light Sleep (mins)': string,
    'Time In Deep Sleep (mins)': string,
    'Sounds Recorded': string,
    'Wake-up mood': string
}

interface SleepGraphData {
    date: Date,
    duration: number,
    sleepQuality: number,
    isNap: boolean
}

class SleepGraph extends Component<SleepGraphProps> {
    render() {
        const data = this.extractSleepData();
        const minDuration: Number = Math.floor(this.arrayMin(data.map(e => e.duration)));
        const maxDuration: Number = Math.ceil(this.arrayMax(data.map(e => e.duration)));
        console.log(minDuration, maxDuration)
        return (
            <div>
                <Card>
                    <Card.Body>
                        <ResponsiveContainer width="100%" height={350}>
                            <ScatterChart>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" name="Date" tickFormatter={this.xAxisFormatter}/>
                                <YAxis dataKey="duration" name="Duration" type="number" unit=" hrs" domain={[minDuration, maxDuration]} />
                                <ZAxis dataKey="sleepQuality" range={[1, 100]} name="Sleep Quality" />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                <Legend />
                                <Scatter name="Sleep Sessions" data={data} fill="#8884d8" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </Card.Body>
                    <Card.Footer>
                        <p>{data.length} sessions recorded. The shortest session was {this.arrayMin(data.map(e => e.duration))} hours.</p>
                    </Card.Footer>
                </Card>

            </div>
        )
    }

    private arrayMin(arr) {
        return arr.reduce(function (p, v) {
            return ( p < v ? p : v );
        });
    }

    private arrayMax(arr) {
        return arr.reduce(function (p, v) {
            return ( p > v ? p : v );
        });
    }


    private xAxisFormatter(tickItem) {
        return moment(tickItem.slice(0, -6)).format("MMM YY")
    }


    private extractSleepData() {
        const { data } = this.props;
        const filtered = data.filter(datum => {
            return datum["Start Time"]
        }).map(datum => {
            return {
                date: datum["Start Time"],
                duration: (Number(datum["Duration (mins)"]) / 60),
                sleepQuality: Number(datum["Sleep Quality (%)"]),
                isNap: datum["Nap"] == "YES"
            }
        }).filter(datum => {
            return Number(datum.duration) > 0 && Number(datum.sleepQuality) > 0 && Number(datum.duration) < 12 && Number(datum.duration) > 3 && datum.date && !datum.isNap;
        });
        return filtered;
    }

}



export default SleepGraph;