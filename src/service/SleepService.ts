import { SleepDataRepository } from '../infrastructure/repository/SleepDataRepository';
import SleepDataConverter from '../converters/SleepDataConverter';
export class SleepService {
    private readonly repository = new SleepDataRepository();
    private readonly converter = new SleepDataConverter()

    getMainGraphData() {
        const data = this.repository.read();
        return this.converter.convertToMainGraphData(data);
    }
}