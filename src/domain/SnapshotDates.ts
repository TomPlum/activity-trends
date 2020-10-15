import { Page } from './Page';

export class SnapshotDates {
    private dates = new Map<Page, string[]>()

    add(page: Page, dates: string[]) {
        this.dates.set(page, dates);
    }

    getDates(page: Page): string[] {
        if (this.dates.has(page)) {
            return this.dates.get(page);
        }
        return [];
    }
}