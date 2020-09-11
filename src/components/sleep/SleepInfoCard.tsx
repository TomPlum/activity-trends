import { Component } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCircle} from '@fortawesome/free-solid-svg-icons';
import Countup from 'react-countup';
import styles from '../../../assets/sass/components/sleep/SleepInfoCard.module.scss';

export interface SleepInfoCardProps {
    value: number,
    unit?: string;
    title: string,
    icon: IconDefinition
}

class SleepInfoCard extends Component<SleepInfoCardProps> {
    render() {
        const { value, title, icon, unit } = this.props;
        return (
            <Card className={styles.card}>
                <Row>
                    <Col xs={4}>
                        <span className="fa-layers fa-fw fa-5x">
                            <FontAwesomeIcon icon={faCircle} className={styles.circle} />
                            <FontAwesomeIcon icon={icon} className={styles.icon} />
                        </span>
                    </Col>
                    <Col xs={8}>
                        <Countup start={0} end={Number(value)} suffix={unit} duration={2} className={styles.value} />
                        <h6 className={styles.title}>{title}</h6>
                    </Col>
                </Row>
            </Card>
        );
    }
}

export default SleepInfoCard;