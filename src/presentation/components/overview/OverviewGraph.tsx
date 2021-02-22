import React, { Component } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Container } from 'react-bootstrap';

export interface OverviewGraphProps {
  data: OverviewGraphData[]
}

export interface OverviewGraphData {
  'Type': string,
  'Start': string,
  'End': string,
  'Duration': string,
  'Distance': string,
  'Average Heart Rate': number,
  'Max Heart Rate': number,
  'Average Pace': string,
  'Average Speed': number,
  'Active Energy': number,
  'Total Energy': number,
  'Elevation Ascended': number,
  'Elevation Descended': number,
  'Weather Temperature': string,
  'Weather Humidity': string
}

class OverviewGraph extends Component<OverviewGraphProps> {
  render() {
    return (
      <Container>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart height={325} data={this.extractOverviewData()}>
            <XAxis dataKey="Date" angle={-45} textAnchor="end"/>
            <YAxis domain={[0, 1200]}/>
            <Tooltip/>
            <Legend/>
            <CartesianGrid stroke="#f5f5f5"/>
            <Area type="monotone" dataKey="Duration" fill="#8884d8" stroke="#8884d8"/>
            <Bar dataKey="Calories Burnt" barSize={4}/>
            <Line type="monotone" dataKey="Average Heart Rate" stroke="#ff7300"/>
          </ComposedChart>
        </ResponsiveContainer>
      </Container>
    )
  }

  extractOverviewData() {
    const data = this.props.data.filter(e => e["Duration"] && e["Average Heart Rate"] && e["Total Energy"] && e["Start"]); //Filter falsy/invalid values out.
    const filtered = data.map(datum => {
      const extracted = Object.keys(datum)
        .filter(key => ["Duration", "Average Heart Rate", "Total Energy", "Start"].includes(key))
        .reduce((obj, key) => {
          obj[key] = datum[key];
          return obj;
        }, {});
      return {
        'Duration': extracted['Duration'].split(":")[1],
        'Average Heart Rate': Number(extracted['Average Heart Rate']).toFixed(2),
        'Calories Burnt': Number(extracted['Total Energy']).toFixed(2),
        'Date': extracted['Start'].split(" ")[0]
      }
    });
    return filtered.slice(0, 50);
  }
}

export default OverviewGraph;