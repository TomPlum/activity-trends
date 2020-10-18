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

    getBranchURI(): string {
        //return process.env.NEXT_PUBLIC_API_GIT_BRANCH_URI + this.branch;
        return "https://github.com/TomPlum/activity-trends-api/tree/" + this.branch;
    }

    getHash(): string {
        return this.hash;
    }

    getCommitURI(): string {
        //return process.env.NEXT_PUBLIC_API_GIT_COMMIT_URI + this.hash;
        return "https://github.com/TomPlum/activity-trends-api/commit/" + this.hash;
    }

    getDate(): string {
        return this.date;
    }
}