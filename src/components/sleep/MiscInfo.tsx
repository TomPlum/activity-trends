import { Component } from "react";
import { Container, Row, Col } from 'react-bootstrap';
import { Mood } from "../../types/Mood";
import { faVolumeOff, faVolumeUp, faClock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import WakeMood from './WakeMood';
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
                    <Col xs={6}>
                        {this.getSoundsRecordedIcon()}
                    </Col>
                    <Col xs={6}>
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
                    <Col xs={6}>
                        <span className={styles.value}>
                            <FontAwesomeIcon icon={faClock} className={styles.icon} size="4x" />
                        </span>
                    </Col>
                    <Col xs={6}>
                        <h1 className={styles.value}>{duration.toFixed(1)}h</h1>
                        <h5 className={styles.title}>Duration Slept</h5>

                    </Col>
                </Row>
            </Container>
        );
    }

    private getSoundsRecordedIcon() {
        const { soundsRecorded } = this.props.data;
        if (soundsRecorded > 0) {
            return <FontAwesomeIcon icon={faVolumeUp} size="4x" className={styles.icon} />
        } else {
            return <FontAwesomeIcon icon={faVolumeOff} size="4x" className={styles.icon} />
        }
    }
}

export default MiscInfo;