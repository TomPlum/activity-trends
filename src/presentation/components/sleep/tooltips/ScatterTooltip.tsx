import React from 'react';
import moment from 'moment';
import styles from '../../../../assets/sass/components/sleep/tooltips/ScatterTooltip.module.scss';

const ScatterTooltip = ({ active, payload }) => {
    if (active) {
        return (
            <div className={styles.wrapper}>
                <p className={styles.value}>
                    <span className={styles.label}>Date: </span>
                    {formatDate(payload[0].value)}
                </p>
                <p className={styles.value}>
                    <span className={styles.label}>Duration: </span>
                    {formatDuration(payload[1].value)}
                </p>
                <p className={styles.value}>
                    <span className={styles.label}>Sleep Quality: </span>
                    {formatSleepQuality(payload[2].value)}
                </p>
            </div>
        );
    }

    return null;
};

function formatDate(date: string): string {
    return moment(date).format("Mo MMM YYYY HH:MM")
}

function formatDuration(duration: number): string {
    return duration.toFixed(1) + " hours";
}

function formatSleepQuality(quality: number): string {
    return quality + "%";
}

export default ScatterTooltip;