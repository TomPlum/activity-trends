import { SleepDataRepository } from '../infrastructure/repository/SleepDataRepository';
import SleepDataConverter from '../converters/SleepDataConverter';

export class SleepService {
    private readonly repository = new SleepDataRepository();
    private readonly converter = new SleepDataConverter()

    async initialise() {
        const data = await this.repository.initialise();
        return this.converter.convertInitialiseResponseData(data);
    }

    getMainGraphData() {
        const data = this.repository.read();
        return this.converter.convertToMainGraphData(data);
    }
}