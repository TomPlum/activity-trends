import React, {Component} from 'react';
import {Area, AreaChart, CartesianGrid, XAxis, YAxis} from 'recharts';
import moment from 'moment';
import GraphContainer from './GraphContainer';
import {Numbers} from "../../utility/Numbers";

interface DummyAreaGraphProps {
    colour: string;
    speed: number;
    sampleSize: number;
    dataBounds: [number, number];
}

interface DummyAreaGraphState {
    timeout: any;
    data: FakeAreaData[];
}

interface FakeAreaData {
    value: number;
    date: string;
}

class DummyAreaGraph extends Component<DummyAreaGraphProps, DummyAreaGraphState> {
    constructor(props) {
        super(props);
        this.state = {
            timeout: undefined,
            data: []
        }
    }

    shift = () => this.setState(() => ({data: this.getFakeData()}))

    componentDidMount() {
        this.shift();
        this.setState({timeout: setInterval(() => this.shift(), this.props.speed) });
    }

    componentWillUnmount() {
        clearInterval(this.state.timeout);
    }

    render() {
        const { colour, speed } = this.props;
        return (
            <GraphContainer>
                <AreaChart data={this.state.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" name="Date" tickFormatter={this.xAxisFormatter} />
                    <YAxis type="number" name="Sleep Quality" unit="%" />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={colour}
                        fill={colour}
                        animationDuration={speed}
                        animationEasing="ease-in-out"
                        fillOpacity={0.4}
                    />
                </AreaChart>
            </GraphContainer>
        );
    }

    private getFakeData(): FakeAreaData[] {
        const { sampleSize, dataBounds } = this.props;
        return [...Array(sampleSize).keys()].map((i) => {
            return {
                value: Numbers.randomInt(dataBounds[0], dataBounds[1]),
                date: moment().add(i, "month").toString()
            }
        });
    }

    private xAxisFormatter = (tickItem: string) => moment(tickItem).format("MMM YY")
}

export default DummyAreaGraph;