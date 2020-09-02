import { Component } from "react";
import { ComposedChart, ResponsiveContainer } from 'recharts';

export interface OverviewGraphProps {
    data: OverviewGraphData[]
}

export interface OverviewGraphData {

}

class OverviewGraph extends Component<OverviewGraphProps> {
    render() {
        return (
            <ResponsiveContainer width="100%">
                <ComposedChart height={400}>

                </ComposedChart>
            </ResponsiveContainer>
        )
    }
}

export default OverviewGraph;