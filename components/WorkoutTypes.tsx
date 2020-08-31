import { Container } from 'react-bootstrap'
import { PieChart, Pie, ResponsiveContainer, Sector } from 'recharts'
import { Component } from 'react';

interface WorkoutTypeProps {
    data: WorkoutData[]
}

export interface WorkoutData {
    'Type': string,
    'Start': string,
    'End': string,
    'Duration': string,
    'Distance': string,
    'Average Heart Rate': string,
    'Max Heart Rate': string,
    'Average Pace': string,
    'Average Speed': string,
    'Active Energy': string,
    'Total Energy': string,
    'Elevation Ascended': string,
    'Elevation Descended': string,
    'Weather Temperature': string,
    'Weather Humidity': string
}

interface WorkoutTypesState {
    activeIndex: number;
}

class WorkoutTypes extends Component<WorkoutTypeProps, WorkoutTypesState> {
    constructor(props: WorkoutTypeProps) {
        super(props);
        this.state = {
            activeIndex: 0
        }
    }

    onPieEnter = (data, index) => {
        this.setState({ activeIndex: index });
    }

    render() {
        return (
            <Container>
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie
                            data={this.extractWorkoutTypes()}
                            nameKey="name"
                            dataKey="value"
                            activeIndex={this.state.activeIndex}
                            activeShape={renderActiveShape}
                            innerRadius={60}
                            outerRadius={80}
                            fill="#52f04d"
                            onMouseEnter={this.onPieEnter}
                            paddingAngle={2}
                        >
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </Container>

        )
    }

    extractWorkoutTypes() {
        const { data } = this.props;
        let counts = {};
        const types = data.map(datum => { return datum["Type"] });
        for (var i = 0; i < types.length; i++) {
            var num = types[i];
            counts[num] = (counts[num] || 0) + 1
        }
        const uniqueTypes = types.filter((v, i, self) => { return self.indexOf(v) === i })
        const result = uniqueTypes.filter(it => {return it}).map(type => {
            if (counts[type] > 5) {
                return {
                    name: type,
                    value: counts[type]
                }
            }
        });
        return result;
    }

}

const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const fill = "#302f2f";
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>{payload.name}</text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 6}
                outerRadius={outerRadius + 10}
                fill="#777877"
            />
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
            <circle cx={ex} cy={ey} r={2} fill="#0cab21" stroke="none" />
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#000000">x{value}</text>
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        </g>
    );
};

export default WorkoutTypes;