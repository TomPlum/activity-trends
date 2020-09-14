import { Component } from 'react';
import { Container } from 'react-bootstrap';
import { SoundThreshold } from '../../types/SoundThreshold';
import { faVolumeDown, faVolumeUp, faVolumeMute, faVolumeOff } from '@fortawesome/free-solid-svg-icons';
import styles from '../../../assets/sass/components/sleep/SoundsRecorded.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface SoundsRecordedProps {
    quantity: number;
}

class SoundsRecorded extends Component<SoundsRecordedProps> {
    render() {
        return (
            <Container>
                <FontAwesomeIcon icon={faVolumeMute} fixedWidth className={this.getClass(SoundThreshold.FLOOR)} />
                <FontAwesomeIcon icon={faVolumeOff} fixedWidth className={this.getClass(SoundThreshold.LOWER)} />
                <FontAwesomeIcon icon={faVolumeDown} fixedWidth className={this.getClass(SoundThreshold.MIDDLE)} />
                <FontAwesomeIcon icon={faVolumeUp} fixedWidth className={this.getClass(SoundThreshold.UPPER)} />
            </Container>
        );
    }

    private getClass = (threshold: SoundThreshold) => SoundThreshold.getThreshold(this.props.quantity) === threshold ? styles.active : styles.inactive
}

export default SoundsRecorded;