import { Component } from 'react';
import SleepGraph, { SleepGraphMainData } from '../src/components/sleep/graphs/SleepGraph';
import { CardDeck, Container, Row, Col } from 'react-bootstrap';
import { faBed, faClock, faSmile } from '@fortawesome/free-solid-svg-icons';
import SleepInfoCard from '../src/components/sleep/SleepInfoCard';
import { SleepService } from '../src/service/SleepService';
import LoadingSpinner from '../src/layout/LoadingSpinner';
import styles from '../assets/sass/pages/sleep.module.scss';

interface SleepProps {
    sleepData: SleepGraphMainData[]
}

interface SleepState {
    loading: boolean;
}

class Sleep extends Component<SleepProps, SleepState> {
    constructor(props) {
        super(props);
        this.state = {
            loading: false
        }
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


                <SleepGraph data={this.props.sleepData} />
            </Container>
        )
    }

    private getAverageSleepQuality() {
        let sum = this.props.sleepData.map(e => e.sleepQuality).reduce((sum, val) => sum + val, 0);
        return Number((sum / this.getSleepSessionQuantity()).toFixed(1));
    }

    private getSleepSessionQuantity() {
        return this.props.sleepData.length;
    }

    private getTotalHoursSlept() {
        const data = this.props.sleepData;
        const hours = data.map(e => e.duration).reduce((sum, val) => sum + val, 0);
        return Math.round(hours);
    }
}

export async function getStaticProps() {
    const graphData: SleepGraphMainData[] = new SleepService().getMainGraphData();

    return {
        props: {
            sleepData: graphData
        }
    }
}

export default Sleep;