import React, { Component } from "react";
import { Area, AreaChart, Brush, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import GraphContainer from "../../GraphContainer";
import { CardioSessions } from "../../../../domain/health/workout/CardioSessions";
import AreaTooltip from "../../sleep/tooltips/AreaTooltip";
import { Arrays } from "../../../../utility/Arrays";
import { AxisDomain } from "recharts/types/util/types";
import moment from "moment";

interface CardioAreaGraphProps {
  data: CardioSessions;
}

class CardioAreaGraph extends Component<CardioAreaGraphProps> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <GraphContainer>
        <AreaChart data={this.props.data.sessions}>
          <CartesianGrid strokeDasharray="3 3"/>
          <XAxis dataKey="_startTime" name="Date" tickFormatter={this.xAxisFormatter}/>
          <YAxis type="number" name="Calories" unit="kcal" width={60}/>
          <Tooltip content={props => <AreaTooltip {...props}/>}/>
          <Area
            type="monotone"
            dataKey="_caloriesBurned"
            stroke="#94d55a"
            fill="#94d55a"
            //activeDot={{onClick: this.onClickArea}}
            animationDuration={2200}
          />
          <Brush
            dataKey='_startDate'
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

  private getBrushEndIndex = () => Math.round(this.props.data.sessions.length / 10)
}

export default CardioAreaGraph;