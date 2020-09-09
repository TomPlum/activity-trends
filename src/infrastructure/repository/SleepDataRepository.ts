import CsvFileReader from "../CsvFileReader";
import SleepDataConverter from "../../converters/SleepDataConverter";

export class SleepDataRepository {
    private readonly reader = new CsvFileReader();
    private readonly converter = new SleepDataConverter();

    read() {
        const csv = this.reader.read('sleep.csv', ', ');
        return this.converter.convert(csv);
    }
}