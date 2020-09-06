import { Component } from 'react';
import DataRepository from '../src/repository/DataRepository';
import SleepDataConverter from '../src/converters/SleepDataConverter';
import SleepGraph, { SleepGraphData } from '../src/components/sleep/SleepGraph';
import { CardDeck, Card, DropdownButton, Dropdown } from 'react-bootstrap';
import { faBed, faClock, faSmile } from '@fortawesome/free-solid-svg-icons';
import SleepInfoCard from '../src/components/sleep/SleepInfoCard';
import styles from '../assets/sass/pages/sleep.module.scss';

interface SleepProps {
    sleepData: SleepGraphData[]
}

class Sleep extends Component<SleepProps> {
    render() {
        return (
            <div>
                <p>This is the sleep page</p>

                <CardDeck>
                    <SleepInfoCard
                        title="Sleep Sessions"
                        value={this.getSleepSessionQuantity()}
                        icon={faBed}
                    />
                    <SleepInfoCard
                        title="Average Sleep Quality"
                        value={this.getAverageSleepQuality()}
                        icon={faSmile}
                    />
                    <SleepInfoCard
                        title="Hours Slept"
                        value={this.getTotalHoursSlept()}
                        icon={faClock}
                    />
                </CardDeck>
                <Card>
                    <Card.Body>
                        <Card.Title>Sleep Quality vs Time</Card.Title>
                        <SleepGraph data={this.props.sleepData} />
                    </Card.Body>
                </Card>
            </div>
        )
    }

    private getAverageSleepQuality() {
        let sum = this.props.sleepData.map(e => e.sleepQuality).reduce((sum, val) => sum + val, 0);
        return (sum / this.getSleepSessionQuantity()).toFixed(1) + "%";
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
    const csv = new DataRepository().read('sleep.csv', ', ');
    const converter = new SleepDataConverter();
    const data = converter.convert(csv.data);
    const graphData = converter.convertToGraphData(data);
    return {
        props: {
            sleepData: graphData
        }
    }
}

export default Sleep;