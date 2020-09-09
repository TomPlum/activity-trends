import { Card } from 'react-bootstrap';
import { Component } from 'react';
import OverviewGraph, { OverviewGraphData } from '../src/components/overview/OverviewGraph';
import DataRepository from '../src/repository/DataRepository';

interface OverviewProps {
  workouts: OverviewGraphData[]
}

class Overview extends Component<OverviewProps> {
  render() {
    return (
      <div>
        <p>This is the overview page.</p>

        <Card>
          <Card.Body>
            <OverviewGraph data={this.props.workouts} />
          </Card.Body>

        </Card>
      </div>
    )
  }
}

export async function getStaticProps() {
  const csv = new DataRepository().read('workouts.csv', ',');
  return {
    props: {
      workouts: csv
    }
  }
}


export default Overview;