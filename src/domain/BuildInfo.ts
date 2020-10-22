export class BuildInfo {
    private readonly version: string;

    constructor(version: string) {
        this.version = version;
    }

    static empty() {
        return new BuildInfo("N/A");
    }

    getVersion(): string {
        return this.version;
    }
}