import React, { Component } from "react";
import { WorkoutSession } from "../../../domain/health/workout/WorkoutSession";
import { Card, Container, Row } from "react-bootstrap";
import { faClock, faFire, faRunning, faTape } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "../../../assets/sass/components/health/cardio/SessionInformation.module.scss";

interface SessionInformationProps {
  data: WorkoutSession;
}

class SessionInformation extends Component<SessionInformationProps> {
  render() {
    const {data} = this.props;
    return (
      <Card className={data ? styles.enabled : styles.disabled}>
        <Card.Body>
          <Card.Title>Session Information</Card.Title>
          {data ? <Container>
              {/* Workout Type */}
              <Row className={styles.row}>
                <FontAwesomeIcon icon={faRunning} className={styles.typeIcon} title={"Workout Type"} fixedWidth/>
                <span className={styles.text}>{data ? data.type : "N/A"}</span>
              </Row>

              {/* Calories Burned */}
              <Row className={styles.row}>
                <FontAwesomeIcon icon={faFire} className={styles.caloriesIcon} title={"Calories Burned"} fixedWidth/>
                <span className={styles.text}>{data ? Math.round(data.caloriesBurned) + " kcal" : "N/A"}</span>
              </Row>

              {/* Duration */}
              <Row className={styles.row}>
                <FontAwesomeIcon icon={faClock} className={styles.durationIcon} title={"Session Duration"} fixedWidth/>
                <span className={styles.text}>{data ? data.duration.toFixed(2) + " mins" : "N/A"}</span>
              </Row>

              {/* Distance */}
              <Row className={styles.row}>
                <FontAwesomeIcon icon={faTape} className={styles.distanceIcon} title={"Distance Travelled"} fixedWidth/>
                <span className={styles.text}>{data ? data.distance.toFixed(2) + " km" : "N/A"}</span>
              </Row>
            </Container> :
            <p>Select a session from the graph above to show further details.</p>
          }
        </Card.Body>
      </Card>
    );
  }
}

export default SessionInformation;