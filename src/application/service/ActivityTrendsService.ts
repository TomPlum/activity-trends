import { ActivityTrendsRepository } from "../../infrastructure/repository/ActivityTrendsRepository";
import { SnapshotDatesConverter } from '../../infrastructure/converters/SnapshotDatesConverter';

export class ActivityTrendsService {
    private readonly repository = new ActivityTrendsRepository();
    private readonly converter = new SnapshotDatesConverter();

    async getSnapshotDates() {
        const data = await this.repository.initialise();
        return this.converter.convert(data);
    }
}