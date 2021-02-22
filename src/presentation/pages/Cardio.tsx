import React, { Component } from "react";
import { Col, Container, Row } from "react-bootstrap";
import PageLoadingSpinner from "../layout/PageLoadingSpinner";
import DisabledOverlay from "../layout/DisabledOverlay";
import { CardioSessions } from "../../domain/health/workout/CardioSessions";
import { HealthService } from "../../application/service/HealthService";
import styles from "../../assets/sass/pages/Sleep.module.scss";
import CardioGraph from "../components/health/graphs/CardioGraph";
import InfoCard from "../components/InfoCard";
import { faClock, faFire, faMicrophone, faRuler, faRunning } from "@fortawesome/free-solid-svg-icons";

interface CardioPageState {
  data: CardioSessions;
  loading: boolean;
}

class Cardio extends Component<{}, CardioPageState> {
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
        <PageLoadingSpinner active={loading}/>
        <DisabledOverlay active={!loading && !data}/>
        <p className={styles.desc}>A graphical overview of the cardio-orientated workouts exported from my Apple watch
          health data.
        </p>

        <Row>
          <Col xl={3} md={6} sm={6} xs={12}>
            <InfoCard title="Sessions" value={this.getSessionQuantity(data)} icon={faRunning} colour={"#94d55a"}/>
          </Col>
          <Col xl={3} md={6} sm={6} xs={12}>
            <InfoCard title="Calories Burned" value={this.getTotalCaloriesBurned(data)} icon={faFire} colour={"#94d55a"}/>
          </Col>
          <Col xl={3} md={6} sm={6} xs={12}>
            <InfoCard title="Total Distance" value={this.getTotalDistance(data)} unit="km" icon={faRuler} colour={"#94d55a"}/>
          </Col>
          <Col xl={3} md={6} sm={6} xs={12}>
            <InfoCard title="Workout Time" value={this.getTotalDuration(data)} icon={faClock} unit="hr" colour={"#94d55a"}/>
          </Col>
        </Row>

        <CardioGraph key={"" + loading} data={data ? data.sessions : undefined}/>
      </Container>
    );
  }

  private getSessionQuantity(data: CardioSessions): number {
    return data ? data.sessions.length : null;
  }

  private getTotalCaloriesBurned(data: CardioSessions): number {
    return data ? Math.round(data.sessions.map(it => it.caloriesBurned).reduce((sum, val) => sum + val, 0)) : null;
  }

  private getTotalDistance(data: CardioSessions): number {
    return data ? data.sessions.map(it => it.distance).reduce((sum, val) => sum + val, 0) : null;
  }

  private getTotalDuration(data: CardioSessions): number {
    if (!data) return null;
    const mins = data.sessions.map(it => it.duration).reduce((sum, val) => sum + val, 0);
    return Number((mins / 60).toFixed(1));
  }

  private
}

export default Cardio;