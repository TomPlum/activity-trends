import styles from '../../assets/sass/components/layout/LoadingSpinner.module.scss';
import ActivityRings from '../../assets/svg/activity-rings.svg';

const LoadingSpinner = (active) => {
    if (active) {
        return (
            <div className={styles.wrapper}>
                <ActivityRings />
                <p>Loading...</p>
            </div>
        );
    }
}

export default LoadingSpinner;