import React, {Component} from 'react';
import {Cell, Pie, PieChart} from 'recharts';
import moment from 'moment';
import GraphContainer from './GraphContainer';
import {Numbers} from "../../utility/Numbers";

interface DummyPieGraphProps {
    colour: string;
    speed: number;
    sampleSize: number;
    dataBounds: [number, number];
}

interface DummyPieGraphState {
    timeout: any;
    data: FakePieData[];
}

interface FakePieData {
    name: string;
    value: number;
    fill: string;
}

class DummyPieGraph extends Component<DummyPieGraphProps, DummyPieGraphState> {
    constructor(props) {
        super(props);
        this.state = {
            timeout: undefined,
            data: []
        }
    }

    shift = () => this.setState(() => ({data: this.getFakeData()}))

    componentDidMount() {
        this.setState({timeout: setInterval(() => this.shift(), this.props.speed) });
    }

    componentWillUnmount() {
        clearInterval(this.state.timeout);
    }

    render() {
        const { data } = this.state;
        return (
            <GraphContainer>
                <PieChart>
                    <Pie
                        data={data}
                        nameKey="name"
                        dataKey="value"
                        innerRadius="25%"
                        animationBegin={0}
                        animationDuration={this.props.speed}
                        animationEasing={"ease-in-out"}
                        paddingAngle={2}
                        fillOpacity={0.4}
                        outerRadius={"100%"}
                    >
                        {this.getSectorColourMappings(data)}
                    </Pie>
                </PieChart>
            </GraphContainer>
        );
    }

    private getFakeData(): FakePieData[] {
        const { sampleSize, dataBounds } = this.props;
        return [...Array(sampleSize).keys()].map((i) => {
            return {
                name: moment().add(i, "month").toString(),
                value: Numbers.randomInt(dataBounds[0], dataBounds[1]),
                fill: "#8884d8"
            }
        });
    }

    private getSectorColourMappings = data => data.map((entry, i) => <Cell key={`cell-${i}`} fill={entry.fill} />)
}

export default DummyPieGraph;