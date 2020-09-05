import { Component } from 'react';
import DataRepository from '../components/DataRepository';
import SleepDataConverter from '../components/SleepDataConverter';
import SleepGraph, { SleepData, SleepGraphData } from '../components/SleepGraph';
import { CardDeck, Card, Row } from 'react-bootstrap';
import styles from '../assets/sass/sleep.module.scss';

interface SleepProps {
    sleepData: SleepGraphData[]
}

class Sleep extends Component<SleepProps> {
    render() {
        return (
            <div>
                <p>This is the sleep page</p>

                <CardDeck>
                    <Card>
                        <h2>{this.getSleepSessionQuantity()}</h2>
                        <h3>Sleep Sessions</h3>
                    </Card>
                    <Card>
                        <h2>{this.getAverageSleepQuality()}%</h2>
                        <h3>Average Sleep Quality</h3>
                    </Card>
                    <Card>
                        <h2>{this.getTotalHoursSlept()}</h2>
                        <h3>Hours Slept</h3>
                    </Card>
                </CardDeck>
                <Card>
                    <Card.Body>
                        <SleepGraph data={this.props.sleepData} />
                    </Card.Body>
                </Card>
            </div>
        )
    }

    private getAverageSleepQuality() {
        let sum = this.props.sleepData.map(e => e.sleepQuality).reduce((sum, val) => sum + val, 0);
        return sum / this.getSleepSessionQuantity();
    }

    private getSleepSessionQuantity() {
        return this.props.sleepData.length;
    }

    private getTotalHoursSlept() {
        return this.props.sleepData.map(e => e.duration).reduce((sum, val) => sum + val, 0);
    }

}

export async function getStaticProps() {
    const csv = new DataRepository().read('sleep.csv', ', ');
    const converter = new SleepDataConverter();
    const data = converter.convert(csv.data);
    const graphData = converter.convertToGraphData(data);
    console.log(graphData)
    return {
        props: {
            sleepData: graphData
        }
    }
}

export default Sleep;