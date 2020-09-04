import { Component } from 'react';
import DataRepository from '../components/DataRepository';
import SleepGraph, { SleepData } from '../components/SleepGraph';

interface SleepProps {
    sleepData: SleepData[]
}
class Sleep extends Component<SleepProps> {
    render() {
        return (
            <div>
                <p>This is the sleep page</p>
                <SleepGraph data={this.props.sleepData}/>
            </div>
        )
    }
}

export async function getStaticProps() {
    const parsed = new DataRepository().read('sleep.csv', ', ');
    return {
        props: {
            sleepData: parsed.data
        }
    }
}

export default Sleep;