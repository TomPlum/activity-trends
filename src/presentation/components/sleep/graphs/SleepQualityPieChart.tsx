import React, { Component } from "react";
import { PieChart, Pie, Tooltip, Cell, Label, Legend } from 'recharts';
import PieTooltip from "../tooltips/PieTooltip";
import GraphContainer from '../../GraphContainer';
import styles from '../../../../assets/sass/components/sleep/graphs/SleepQualityPieChart.module.scss';

interface SleepQualityPieChartProps {
    data: SleepQualityPieChartData
}

export interface SleepQualityPieChartData {
    awakeTime: number,
    remSleep: number,
    lightSleep: number,
    deepSleep: number,
    sleepQuality: number
}

class SleepQualityPieChart extends Component<SleepQualityPieChartProps> {
    render() {
        const data = this.createGraphData();
        return (
            <GraphContainer>
                <PieChart>
                    <Pie data={data} nameKey="name" dataKey="value" innerRadius="40%" animationBegin={0} paddingAngle={5}>
                        <Label className={styles.label} position="center" value={this.getSleepQualityLabel()} />
                        {this.getSectorColourMappings(data)}
                    </Pie>
                    <Tooltip content={props => <PieTooltip {...props} />} />
                    <Legend />
                </PieChart>
            </GraphContainer>
        );
    }

    private getSectorColourMappings = data => data.map((entry, i) => <Cell key={`cell-${i}`} fill={entry.fill} />)

    private getSleepQualityLabel = () => this.props.data.sleepQuality + "%";

    private createGraphData() {
        const { data } = this.props;
        return [
            { name: "Awake Time", value: data.awakeTime, fill: "rgba(247, 163, 52, 0.6)", stroke: "rgba(247, 163, 52, 1)" },
            { name: "REM Sleep", value: data.remSleep, fill: "rgba(240, 101, 210, 0.6)",  stroke: "rgba(240, 101, 210, 1)" },
            { name: "Light Sleep", value: data.lightSleep, fill: "rgba(80, 217, 108, 0.6)", stroke: "rgba(80, 217, 108, 1)" },
            { name: "Deep Sleep", value: data.deepSleep, fill: "rgba(52, 179, 247, 0.6)", stroke: "rgba(52, 179, 247, 1)" }
        ];
    }
}

export default SleepQualityPieChart;