import React, { Component } from "react";
import { Container } from "react-bootstrap";
import LoadingSpinner from "../layout/LoadingSpinner";
import DisabledOverlay from "../layout/DisabledOverlay";
import { CardioSessions } from "../../domain/health/workout/CardioSessions";
import { HealthService } from "../../application/service/HealthService";

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
    this.setState({ loading: true });
    const data = await new HealthService().getOutdoorExercise();
    this.setState({ loading: false, data });
  }

  render() {
    const { data, loading } = this.state;
    return (
      <Container fluid className={"page-container"}>
        <LoadingSpinner active={loading}/>
        <DisabledOverlay active={!loading && !data}/>
        {data}
      </Container>
    );
  }
}

export default Running;