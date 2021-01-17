import React, {Component} from 'react';
import {Cell, Pie, PieChart} from 'recharts';
import moment from 'moment';
import GraphContainer from './GraphContainer';
import {Numbers} from "../../utility/Numbers";
import {Colours} from "../../utility/Colours";

interface DummyPieGraphProps {
    gradient: [string, string];
    speed: number;
    sectors: number;
    range: [number, number];
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
        this.shift();
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
        const { sectors, range, gradient } = this.props;
        const fills = Colours.gradient(gradient[0], gradient[1], sectors);
        return [...Array(sectors).keys()].map((i) => {
            return {
                name: moment().add(i, "month").toString(),
                value: Numbers.randomInt(range[0], range[1]),
                fill: fills[i]
            }
        });
    }

    private getSectorColourMappings = data => data.map((entry, i) => <Cell key={`cell-${i}`} fill={entry.fill} />)
}

export default DummyPieGraph;