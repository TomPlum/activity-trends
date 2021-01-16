import { ActivityTrendsRepository } from "../../infrastructure/repository/ActivityTrendsRepository";
import { SnapshotDatesConverter } from '../../infrastructure/converters/SnapshotDatesConverter';
import { SnapshotDates } from "../../domain/SnapshotDates";

export class ActivityTrendsService {
    private readonly repository = new ActivityTrendsRepository();
    private readonly converter = new SnapshotDatesConverter();

    async getSnapshotDates(): Promise<SnapshotDates> {
        const data = await this.repository.initialise().catch(e => {throw e});
        return this.converter.convert(data);
    }
}