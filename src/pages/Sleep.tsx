import { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { faBed, faClock, faSmile } from '@fortawesome/free-solid-svg-icons';
import { SleepGraphMainData } from '../components/sleep/graphs/SleepGraph';
import LoadingSpinner from '../layout/LoadingSpinner';
import SleepInfoCard from '../components/sleep/SleepInfoCard';
import { SleepService } from '../service/SleepService';
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

    async componentDidMount() {
        const data = await new SleepService().initialise();
        this.setState({ sleepData: data });
    }

    render() {
        return (
            <Container fluid>
                <LoadingSpinner active={this.state.loading}/>
                <p>Visualing the data recorded by the iOS Pillow app from my watch.</p>

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

                <SleepGraph data={this.state.sleepData} />
            </Container>
        )
    }

    private getAverageSleepQuality() {
        let sum = this.state.sleepData.map(e => e.sleepQuality).reduce((sum, val) => sum + val, 0);
        return Number((sum / this.getSleepSessionQuantity()).toFixed(1));
    }

    private getSleepSessionQuantity() {
        return this.state.sleepData.length;
    }

    private getTotalHoursSlept() {
        const data = this.state.sleepData;
        const hours = data.map(e => e.duration).reduce((sum, val) => sum + val, 0);
        return Math.round(hours);
    }
}

export default Sleep;