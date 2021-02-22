import React, { Component } from 'react';
import moment from 'moment';
import styles from '../../../../assets/sass/components/sleep/tooltips/BarTooltip.module.scss';

interface BarTooltipState {
  active: boolean;
  payload: any;
}

class BarTooltip extends Component<{}, BarTooltipState> {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      payload: null
    }
  }

  render() {
    const {active, payload} = this.state;

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
  }
};

function formatDate(date: string): string {
  return moment(date).format("Mo MMM YYYY HH:MM")
}

function formatSleepQuality(value: number): string {
  return value.toFixed(0) + "%";
}

export default BarTooltip;