import { Card, Container } from 'react-bootstrap';
import React, { Component } from 'react';
import OverviewGraph, {OverviewGraphData} from "../components/overview/OverviewGraph";
import CsvFileReader from "../../infrastructure/CsvFileReader";

interface OverviewState {
    workouts: OverviewGraphData[]
}

class Overview extends Component<{}, OverviewState> {
    constructor(props) {
        super(props);
        this.state = {
            workouts: undefined
        }
    }

    async componentWillMount() {
        //const csv = new CsvFileReader().read('workouts.csv', ',');
        this.setState({ workouts: undefined });
    }

    render() {
        const { workouts } = this.state;
        return (
            <Container fluid>
                <p>This is the overview page.</p>

                <Card>
                    <Card.Body>
                        { workouts && <OverviewGraph data={workouts} /> }
                    </Card.Body>

                </Card>
            </Container>
        );
    }
}

export default Overview;