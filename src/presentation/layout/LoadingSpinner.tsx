import ActivityRings from './ActivityRings';
import React from 'react';
import styles from '../../assets/sass/components/layout/LoadingSpinner.module.scss';

const LoadingSpinner = ({active}) => {
    if (active) {
        return (
            <div className={styles.wrapper}>
                <ActivityRings />
                {/* <p className={styles.loading}>Loading...</p> */}
            </div>
        );
    }
    return null;
}

export default LoadingSpinner;