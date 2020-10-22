import React from 'react';
import styles from '../../../assets/sass/components/sleep/tooltips/PieTooltip.module.scss';

const PieTooltip = ({ active, payload }) => {
    if (active) {
        return (
            <div className={styles.wrapper}>
                <p className={styles.value}>
                    <span className={styles.label}>{payload[0].name}: </span>
                    {formatValue(payload[0].value)}
                </p>
            </div>
        );
    }

    return null;
};

function formatValue(value: number): string {
    return value.toFixed(1) + " hours";
}

export default PieTooltip;