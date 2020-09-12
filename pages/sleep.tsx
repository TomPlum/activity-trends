import { Component } from 'react';
import SleepGraph, { SleepGraphMainData } from '../src/components/sleep/graphs/SleepGraph';
import { CardDeck } from 'react-bootstrap';
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
            <div>
                <p>Visualing the data recorded by the iOS Pillow app from my watch.</p>

                <CardDeck>
                    <SleepInfoCard
                        title="Sleep Sessions"
                        value={this.getSleepSessionQuantity()}
                        icon={faBed}
                    />
                    <SleepInfoCard
                        title="Average Sleep Quality"
                        value={this.getAverageSleepQuality()}
                        unit="%"
                        icon={faSmile}
                    />
                    <SleepInfoCard
                        title="Hours Slept"
                        value={this.getTotalHoursSlept()}
                        icon={faClock}
                    />
                </CardDeck>
                <SleepGraph data={this.props.sleepData} />
            </div>
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