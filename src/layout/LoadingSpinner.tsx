import styles from '../../assets/sass/components/layout/LoadingSpinner.module.scss';
import ActivityRings from './ActivityRings';

const LoadingSpinner = ({active}) => {
    if (active) {
        return (
            <div className={styles.wrapper}>
                <ActivityRings className={styles.rings} />
                {/* <p className={styles.loading}>Loading...</p> */}
            </div>
        );
    }
    return null;
}

export default LoadingSpinner;