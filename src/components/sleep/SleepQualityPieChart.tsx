import { Component } from "react";
import { PieChart, Pie, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { faAtlas } from "@fortawesome/free-solid-svg-icons";

interface SleepQualityPieChartProps {
    data: SleepQualityPieChartData
}

export interface SleepQualityPieChartData {
    awakeTime: number,
    remSleep: number,
    lightSleep: number,
    deepSleep: number,
}

class SleepQualityPieChart extends Component<SleepQualityPieChartProps> {
    render() {
        const data = this.createGraphData();
        return (
            <>
                <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                        <Pie
                            data={data}
                            nameKey="name"
                            dataKey="value"
                            labelLine={false}
                            innerRadius="40%"
                        >
                            {
                                this.getSectorColourMappings(data)
                            }
                        </Pie>
                        <Tooltip/>
                    </PieChart>
                </ResponsiveContainer>
            </>
        );
    }

    private getSectorColourMappings(data) {
        return data.map((entry, i) => <Cell key={`cell-${i}`} fill={entry.color} />)
    }

    private createGraphData() {
        const { data } = this.props;
        return [
            { name: "Awake Time", value: data.awakeTime, color: "#f7a334" },
            { name: "REM Sleep", value: data.remSleep, color: "#f065d2" },
            { name: "Light Sleep", value: data.lightSleep, color: "#50d96c" },
            { name: "Deep Sleep", value: data.deepSleep, color: "#34b3f7" }
        ]
    }
}

export default SleepQualityPieChart;