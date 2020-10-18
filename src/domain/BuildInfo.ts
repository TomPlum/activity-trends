export class BuildInfo {
    private readonly version: string;

    constructor(version: string) {
        this.version = version;
    }

    getVersion(): string {
        return this.version;
    }
}