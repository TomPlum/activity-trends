import styles from '../assets/css/pages/index.module.css';
import { Card } from 'react-bootstrap';
import { Component } from 'react';
import OverviewGraph, { OverviewGraphData } from '../components/OverviewGraph';
import DataRepository from '../components/DataRepository';

interface OverviewProps {
  workoutData: OverviewGraphData[]
}

class Overview extends Component<OverviewProps> {
  render() {
    return (
      <div>
        <p>This is the overview page.</p>

        <Card className={styles.card}>
          <OverviewGraph data={this.props.workoutData}/>
        </Card>
      </div>
    )
  }
}

export async function getStaticProps() {
  const parsed = new DataRepository().read('workouts.csv');
  return {
      props: {
          workouts: parsed.data
      }
  }
}


export default Overview;