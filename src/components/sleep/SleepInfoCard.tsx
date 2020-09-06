import { Component } from 'react';
import { Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import styles from '../../../assets/sass/components/sleep/sleepinfocard.module.scss';

export interface SleepInfoCardProps {
    value: number | string,
    title: string,
    icon: IconDefinition
}

class SleepInfoCard extends Component<SleepInfoCardProps> {
    render() {
        const { value, title, icon } = this.props;
        return (
            <Card className={styles.card}>
                <FontAwesomeIcon icon={icon} fixedWidth size="2x" className={styles.icon}/>
                <h2 className={styles.value}>{value}</h2>
                <h6 className={styles.title}>{title}</h6>
            </Card>
        )   
    }
}

export default SleepInfoCard;