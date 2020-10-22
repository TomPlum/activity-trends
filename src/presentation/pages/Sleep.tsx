import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { faBed, faClock, faSmile } from '@fortawesome/free-solid-svg-icons';
import { SleepGraphMainData } from '../components/sleep/graphs/SleepGraph';
import LoadingSpinner from '../layout/LoadingSpinner';
import SleepInfoCard from '../components/sleep/SleepInfoCard';
import { SleepService } from '../../application/service/SleepService';
import SleepGraph from '../components/sleep/graphs/SleepGraph';

interface SleepState {
    sleepData: SleepGraphMainData[]
    loading: boolean;
}

class Sleep extends Component<{}, SleepState> {
    constructor(props) {
        super(props);
        this.state = {
            sleepData: undefined,
            loading: false
        }
    }

    async componentWillMount() {
        this.setState({ loading: true });
        const data = await new SleepService().initialise();
        this.setState({ sleepData: data, loading: false });
    }

    render() {
        const { sleepData } = this.state;

        return (
            <Container fluid>
                <LoadingSpinner active={this.state.loading}/>
                <p>Visualising the data recorded by the iOS Pillow app from my watch.</p>

                <Row>
                    <Col md={4} sm={12}>
                        <SleepInfoCard
                            title="Sessions"
                            value={this.getSleepSessionQuantity()}
                            icon={faBed}
                        />
                    </Col>
                    <Col md={4} sm={12}>
                        <SleepInfoCard
                            title="Avg Quality"
                            value={this.getAverageSleepQuality()}
                            unit="%"
                            icon={faSmile}
                        />
                    </Col>
                    <Col md={4} sm={12}>
                        <SleepInfoCard
                            title="Hours Slept"
                            value={this.getTotalHoursSlept()}
                            icon={faClock}
                        />
                    </Col>
                </Row>

                { sleepData && <SleepGraph data={sleepData} /> }
            </Container>
        )
    }

    private getAverageSleepQuality(): number {
        const { sleepData } = this.state;
        if (!sleepData) return 0;
        let sum = this.state.sleepData.map(e => e.sleepQuality).reduce((sum, val) => sum + val, 0);
        return Number((sum / this.getSleepSessionQuantity()).toFixed(1));
    }

    private getSleepSessionQuantity(): number {
        const { sleepData } = this.state;
        return sleepData ? sleepData.length : 0;
    }

    private getTotalHoursSlept(): number {
        const { sleepData } = this.state;
        if (!sleepData) return 0;
        const hours = sleepData.map(e => e.duration).reduce((sum, val) => sum + val, 0);
        return Math.round(hours);
    }
}

export default Sleep;