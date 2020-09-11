import styles from '../../../../assets/sass/components/sleep/tooltips/AreaTooltip.module.scss';
import moment from 'moment';

const AreaTooltip = ({ active, payload }) => {
    if (active) {
        return (
            <div className={styles.wrapper}>
                <p className={styles.value}>
                    <span className={styles.label}>Date: </span>
                    {formatDate(payload[0].payload.date)}
                </p>

                <p className={styles.value}>
                    <span className={styles.label}>Sleep Quality: </span>
                    {formatSleepQuality(payload[0].value)}
                </p>
            </div>
        );
    }

    return null;
};

function formatDate(date: string): string {
    return moment(date).format("Mo MMM YYYY HH:MM")
}

function formatSleepQuality(value: number): string {
    return value.toFixed(0) + "%";
}

export default AreaTooltip;