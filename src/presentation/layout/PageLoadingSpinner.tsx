import ActivityRings from './ActivityRings';
import React from 'react';
import styles from '../../assets/sass/components/layout/PageLoadingSpinner.module.scss';

const PageLoadingSpinner = ({active}) => {
  if (active) {
    return (
      <div className={styles.wrapper}>
        <ActivityRings/>
      </div>
    );
  }
  return null;
}

export default PageLoadingSpinner