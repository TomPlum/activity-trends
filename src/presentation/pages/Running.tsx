import React, { Component } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import LoadingSpinner from "../layout/LoadingSpinner";
import DisabledOverlay from "../layout/DisabledOverlay";
import { CardioSessions } from "../../domain/health/workout/CardioSessions";
import { HealthService } from "../../application/service/HealthService";
import CardioAreaGraph from "../components/health/graphs/CardioAreaGraph";
import DummyAreaGraph from "../components/DummyAreaGraph";
import styles from "../../assets/sass/pages/Sleep.module.scss";

interface RunningState {
  data: CardioSessions;
  loading: boolean;
}

class Running extends Component<{}, RunningState> {
  constructor(props) {
    super(props);
    this.state = {
      data: undefined,
      loading: true
    }
  }

  async componentDidMount() {
    this.setState({loading: true});
    const data = await new HealthService().getCardioSessions();
    this.setState({loading: false, data});
  }

  render() {
    const {data, loading} = this.state;
    return (
      <Container fluid className={"page-container"}>
        <LoadingSpinner active={loading}/>
        <DisabledOverlay active={!loading && !data}/>
        <p className={styles.desc}>A graphical overview of the cardio-orientated workouts exported from my Apple watch
          health data.
        </p>
        <Row>
          <Col xs={12}>
            <Card>
              <Card.Body>
                <Card.Title>Calories Burned vs Duration</Card.Title>
                {data ?
                  <CardioAreaGraph data={data}/> :
                  <DummyAreaGraph colour={"#000000"} speed={2000} sampleSize={30} dataBounds={[50, 1000]}/>
                }
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Running;