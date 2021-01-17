import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import styles from '../../../assets/sass/components/sleep/SleepDuration.module.scss';

interface SleepDurationProps {
    duration: number;
}

class SleepDuration extends Component<SleepDurationProps> {
    render() {
        return (
            <Container className={styles.container}>
                <FontAwesomeIcon icon={faClock} className={styles.icon} />
            </Container>
        );
    }
}

export default SleepDuration;