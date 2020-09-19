import styles from '../../assets/sass/components/layout/ActivityRings.module.scss';

const ActivityRings = () => {
    return (
        <svg className={styles.svg} viewBox='0 0 37 37'>
            <g className={styles.ring + " " + styles.move}>
                <circle className={styles.background}
                    cx="50%" cy="50%"
                    r="15.915"
                    stroke-width="3"
                />
                <circle className={styles.completed}
                    cx="50%" cy="50%"
                    r="15.915"
                    stroke-width="3"
                    stroke-dasharray="100, 100"
                />
            </g>

            <g className={styles.ring + " " + styles.exercise}>
                <circle className={styles.background}
                    cx="50%" cy="50%"
                    r="15.915"
                    stroke-width="4"
                />
                <circle className={styles.completed}
                    cx="50%" cy="50%"
                    r="15.915"
                    stroke-width="4"
                    stroke-dasharray="100, 100"
                />
            </g>

            <g className={styles.ring + " " + styles.stand}>
                <circle className={styles.background}
                    cx="50%" cy="50%"
                    r="15.915"
                    stroke-width="6"
                />
                <circle className={styles.completed}
                    cx="50%" cy="50%"
                    r="15.915"
                    stroke-width="6"
                    stroke-dasharray="100, 100"
                />
            </g>
        </svg>
    );
}

export default ActivityRings;