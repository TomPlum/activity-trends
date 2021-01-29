import React, { Component } from "react";
import { WorkoutSession } from "../../../../domain/health/workout/WorkoutSession";
import CardioAreaGraph from "./CardioAreaGraph";
import DummyAreaGraph from "../../DummyAreaGraph";
import { Card, Col, Row } from "react-bootstrap";
import SessionInformation from "../SessionInformation";

interface CardioGraphProps {
  data: WorkoutSession[];
}

interface CardioGraphState {
  selectedSession: WorkoutSession;
}

class CardioGraph extends Component<CardioGraphProps, CardioGraphState> {
  constructor(props) {
    super(props);
    this.state = {
      selectedSession: undefined
    }
  }

  render() {
    const {data} = this.props;
    const {selectedSession} = this.state;
    return (
      <>
        <Row>
          <Col xs={12}>
            <Card>
              <Card.Body>
                <Card.Title>Calories Burned vs Duration</Card.Title>
                {data ?
                  <CardioAreaGraph data={data} onSelectSession={(data) => this.setState({selectedSession: data})}/> :
                  <DummyAreaGraph colour={"#94d55a"} speed={2000} sampleSize={30} dataBounds={[50, 1000]}/>
                }
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col lg={6} xs={12}>
            <Card>
              <Card.Body>
                <Card.Title>Session Information</Card.Title>
                <SessionInformation data={selectedSession}/>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </>
    );
  }
}

export default CardioGraph;