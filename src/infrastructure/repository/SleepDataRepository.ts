import CsvFileReader from "../CsvFileReader";
import SleepDataConverter from "../../converters/SleepDataConverter";
import RestClient from "../RestClient";

export class SleepDataRepository {
    private readonly reader = new CsvFileReader();
    private readonly converter = new SleepDataConverter();

    read() {
        const csv = this.reader.read('sleep.csv', ', ');
        return this.converter.convert(csv);
    }

    async initialise() {
        return await RestClient.get('/sleep/initialise')
    }
}