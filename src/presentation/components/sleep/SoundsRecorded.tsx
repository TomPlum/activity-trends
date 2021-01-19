import React, { Component } from 'react';
import { Container, ProgressBar, Row, Col } from 'react-bootstrap';
import { SoundThreshold, getThreshold } from '../../../domain/SoundThreshold';
import { faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from '../../../assets/sass/components/sleep/SoundsRecorded.module.scss';

interface SoundsRecordedProps {
    quantity: number;
}

class SoundsRecorded extends Component<SoundsRecordedProps> {
    render() {
        return (
            <Container className={styles.container}>
                <FontAwesomeIcon
                    icon={faVolumeMute}
                    fixedWidth
                    className={this.getClass(SoundThreshold.FLOOR) + " left"}
                />
                <ProgressBar now={this.getBarFillPercentage()} className={styles.bar} />
                <FontAwesomeIcon
                    icon={faVolumeUp}
                    fixedWidth
                    className={this.getClass(SoundThreshold.UPPER) + " right"}
                />
            </Container>
        );
    }

    private getClass = (threshold: SoundThreshold) => getThreshold(this.props.quantity) === threshold ? styles.active : styles.inactive

    private getBarFillPercentage() {
        const threshold = getThreshold(this.props.quantity);
        switch (threshold) {
            case SoundThreshold.FLOOR: return 0;
            case SoundThreshold.LOWER: return 25;
            case SoundThreshold.MIDDLE: return 50;
            case SoundThreshold.UPPER: return 75;
            default: return 0;
        }
    }
}

export default SoundsRecorded;