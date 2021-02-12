import React, { Component } from "react";
import { Area, AreaChart, Brush, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import GraphContainer from "../../GraphContainer";
import AreaTooltip from "../../sleep/tooltips/AreaTooltip";
import moment from "moment";
import { WorkoutSession } from "../../../../domain/health/workout/WorkoutSession";
import {WorkoutSessionConverter} from "../../../../infrastructure/converters/WorkoutSessionConverter";

interface CardioAreaGraphProps {
  data: WorkoutSession[];
  onSelectSession: (session) => void;
}

class CardioAreaGraph extends Component<CardioAreaGraphProps> {
  constructor(props) {
    super(props);
  }

  onClickDot = (data) => {
    const session = new WorkoutSessionConverter().convertGraphPayload(data.payload);
    this.props.onSelectSession(session);
  }

  render() {
    return (
      <GraphContainer>
        <AreaChart data={this.props.data}>
          <CartesianGrid strokeDasharray="3 3"/>
          <XAxis dataKey="_startTime" name="Date" tickFormatter={this.xAxisFormatter}/>
          <YAxis type="number" name="Calories" unit="kcal" width={60}/>
          <Tooltip content={props => <AreaTooltip {...props}/>}/>
          <Area
            type="monotone"
            dataKey="_caloriesBurned"
            stroke="#94d55a"
            fill="#94d55a"
            activeDot={{onClick: this.onClickDot}}
            animationDuration={2200}
          />
          <Brush
            dataKey='_startTime'
            height={30}
            stroke="#94d55a"
            endIndex={this.getBrushEndIndex()}
            tickFormatter={this.xAxisFormatter}
          />
        </AreaChart>
      </GraphContainer>
    );
  }

  private xAxisFormatter = (tickItem: string) => moment(tickItem).format("MMM YY")

  private static yAxisFormatter(tickItem: number) {
    const s = tickItem.toString();
    return tickItem >= 1000 ? s.substring(0, 1) + "." + s.substring(1, 2) + "k" : s;
  }

  private getBrushEndIndex = () => Math.round(this.props.data.length / 10)
}

export default CardioAreaGraph;