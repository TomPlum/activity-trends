import { SleepDataRepository } from '../infrastructure/repository/SleepDataRepository';
import SleepDataConverter from '../converters/SleepDataConverter';

export class SleepService {
    private readonly repository = new SleepDataRepository();
    private readonly converter = new SleepDataConverter()

    async initialise() {
        const data = await this.repository.initialise();
        return this.converter.convertInitialiseResponseData(data);
    }

    async getSnapshot(date: string) {
        const data = await this.repository.getSnapshot(date);
        return this.converter.convertSnapshotData(data);
    }
}