import CsvFileReader from "../CsvFileReader";
import SleepDataConverter from "../../converters/SleepDataConverter";
import RestClient from "../RestClient";
import { SleepInitialiseData } from '../../types/Sleep';

export class SleepDataRepository {
    private readonly reader = new CsvFileReader();
    private readonly converter = new SleepDataConverter();

    read() {
        const csv = this.reader.read('sleep.csv', ', ');
        return this.converter.convert(csv);
    }

    async initialise(): Promise<SleepInitialiseData> {
        const response = await RestClient.get<SleepInitialiseData>('/sleep/initialise')
    
        if (response.data) {
            return response.data;
        }
    }

    async getSnapshot(date: string) {
        return await RestClient.get('/sleep/snapshot/' + date)
    }
}