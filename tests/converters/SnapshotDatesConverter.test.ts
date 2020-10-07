import { SnapshotDatesConverter } from '../../src/converters/SnapshotDatesConverter';
import { InitialiseResponse } from '../../src/types/Common';
import { SnapshotDates } from '../../src/domain/SnapshotDates';
import { Page } from '../../src/domain/Page';

describe('Snapshot Dates Response Converter', () => {
    const converter = new SnapshotDatesConverter();

    it('Should successfully convert a valid API response', () => {
        const source = getSource();
        const target = converter.convert(source);
        expect(target).toBe(getExpectedTarget());
    });

    function getSource(): InitialiseResponse {
        return {
            snapshotDates: {
                sleep: ["2020-10-04", "2020-10-06"]
            }
        }
    }

    function getExpectedTarget(): SnapshotDates {
        const dates = new SnapshotDates();
        dates.add(Page.SLEEP, ["2020-10-04", "2020-10-06"]);
        return dates;
    }
});

export default describe;