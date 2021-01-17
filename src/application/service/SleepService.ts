import { SleepDataRepository } from '../../infrastructure/repository/SleepDataRepository';
import SleepDataConverter from '../../infrastructure/converters/SleepDataConverter';

export class SleepService {
    private readonly repository = new SleepDataRepository();
    private readonly converter = new SleepDataConverter()

    async initialise() {
        return await this.repository.initialise()
            .then(data => this.converter.convertInitialiseResponseData(data))
            .catch(e => null);
    }

    async getSnapshot(date: string) {
        const data = await this.repository.getSnapshot(date);
        return this.converter.convertSnapshotData(data);
    }
}