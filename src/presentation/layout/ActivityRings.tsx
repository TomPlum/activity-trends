import React from 'react';
import styles from '../../assets/sass/components/layout/ActivityRings.module.scss'

const ActivityRings = () => {
    return (
        <svg className={styles.svg} viewBox='0 0 37 37'>
            <g className={styles.ring + " " + styles.move}>
                <circle className={styles.background}
                    cx="50%" cy="50%"
                    r="15.915"
                    strokeWidth="3"
                />
                <circle className={styles.completed}
                    cx="50%" cy="50%"
                    r="15.915"
                    strokeWidth="3"
                    strokeDasharray="100, 100"
                />
            </g>

            <g className={styles.ring + " " + styles.exercise}>
                <circle className={styles.background}
                    cx="50%" cy="50%"
                    r="15.915"
                    strokeWidth="4"
                />
                <circle className={styles.completed}
                    cx="50%" cy="50%"
                    r="15.915"
                    strokeWidth="4"
                    strokeDasharray="100, 100"
                />
            </g>

            <g className={styles.ring + " " + styles.stand}>
                <circle className={styles.background}
                    cx="50%" cy="50%"
                    r="15.915"
                    strokeWidth="6"
                />
                <circle className={styles.completed}
                    cx="50%" cy="50%"
                    r="15.915"
                    strokeWidth="6"
                    strokeDasharray="100, 100"
                />
            </g>
        </svg>
    );
}

export default ActivityRings;