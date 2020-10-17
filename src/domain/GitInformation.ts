export class GitInformation {
    private readonly branch: string;
    private readonly hash: string;
    private readonly date: string;

    constructor(branch: string, hash: string, date: string) {
        this.branch = branch;
        this.hash = hash;
        this.date = date;
    }

    getBranch(): string {
        return this.branch;
    }

    getHash(): string {
        return this.hash;
    }

    getDate(): string {
        return this.date;
    }
}