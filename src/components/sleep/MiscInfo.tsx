import { Component } from "react";
import { Container, Row, Col } from 'react-bootstrap';
import { Mood } from "../../types/Mood";
import SleepDuration from "./SleepDuration";
import WakeMood from './WakeMood';
import SoundsRecorded from './SoundsRecorded';
import styles from '../../../assets/sass/components/sleep/MiscInfo.module.scss'

interface MiscInfoProps {
    data: MiscInfoData;
}

export interface MiscInfoData {
    soundsRecorded: number;
    mood: Mood;
    duration: number;
}

class MiscInfo extends Component<MiscInfoProps> {
    render() {
        const { soundsRecorded, mood, duration } = this.props.data;

        return (
            <Container className={styles.container}>
                <Row className={styles.row}>
                    <Col xs={8}>
                        <SoundsRecorded quantity={soundsRecorded} />
                    </Col>
                    <Col xs={4}>
                        <h1 className={styles.value}>{soundsRecorded}</h1>
                        <h5 className={styles.title}>Sounds Recorded</h5>
                    </Col>
                </Row>
                <Row className={styles.row}>
                    <Col xs={8}>
                        <WakeMood mood={mood}/>
                    </Col>
                    <Col xs={4}>
                        <h1 className={styles.value}>{mood}</h1>
                        <h5 className={styles.title}>Wake-Up Mood</h5>
                    </Col>
                </Row>
                <Row className={styles.row}>
                    <Col xs={8}>
                        <SleepDuration duration={duration}/>
                    </Col>
                    <Col xs={4}>
                        <h1 className={styles.value}>{duration.toFixed(1)}h</h1>
                        <h5 className={styles.title}>Duration Slept</h5>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default MiscInfo;