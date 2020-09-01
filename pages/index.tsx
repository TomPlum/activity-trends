import styles from '../assets/css/pages/index.module.css';
import { Card } from 'react-bootstrap';
import { Component } from 'react';
import { ComposedChart } from 'recharts';

interface OverviewProps {
  overviewGraphData: OverviewGraphData[]
}

interface OverviewGraphData {

}

class Overview extends Component {
  render() {
    return (
      <div>
        <p>This is the overview page.</p>

        <Card className={styles.card}>
          <ComposedChart width="100%" height={400}>

          </ComposedChart>
        </Card>
      </div>
    )
  }
}

export default Overview;