import React, { Component } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import LoadingSpinner from "../layout/LoadingSpinner";
import DisabledOverlay from "../layout/DisabledOverlay";
import { CardioSessions } from "../../domain/health/workout/CardioSessions";
import { HealthService } from "../../application/service/HealthService";
import styles from "../../assets/sass/pages/Sleep.module.scss";
import CardioGraph from "../components/health/graphs/CardioGraph";

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
        <LoadingSpinner active={loading}/>
        <DisabledOverlay active={!loading && !data}/>
        <p className={styles.desc}>A graphical overview of the cardio-orientated workouts exported from my Apple watch
          health data.
        </p>
        <CardioGraph key={"" + loading} data={data ? data.sessions : undefined}/>
      </Container>
    );
  }
}

export default Cardio;