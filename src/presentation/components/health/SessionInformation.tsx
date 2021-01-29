import React, { Component } from "react";
import { WorkoutSession } from "../../../domain/health/workout/WorkoutSession";
import { Container, Row } from "react-bootstrap";
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
      <Container className={styles.container}>
        <Row className={styles.row}>
          {/* Workout Type */}
          <FontAwesomeIcon icon={faRunning} className={styles.typeIcon} fixedWidth/>
          <span className={styles.text}>{data ? data.type : "N/A"}</span>

          {/* Calories Burned */}
          <FontAwesomeIcon icon={faFire} className={styles.caloriesIcon} fixedWidth/>
          <span className={styles.text}>{data ? data.caloriesBurned : "N/A"}</span>

          {/* Duration */}
          <FontAwesomeIcon icon={faClock} className={styles.durationIcon} fixedWidth/>
          <span className={styles.text}>{data ? data.duration : "N/A"}</span>

          {/* Distance */}
          <FontAwesomeIcon icon={faTape} className={styles.distanceIcon} fixedWidth/>
          <span className={styles.text}>{data ? data.distance : "N/A"}</span>

        </Row>
      </Container>
    );
  }
}

export default SessionInformation;