import { InitialiseResponse } from '../types/Common';
import { SnapshotDates } from '../domain/SnapshotDates';
import { Page } from '../domain/Page';

export class SnapshotDatesConverter {
    convert(response: InitialiseResponse): SnapshotDates {
        const dates = new SnapshotDates();
        dates.add(Page.SLEEP, response.snapshotDates.sleep);
        return dates;
    }
}