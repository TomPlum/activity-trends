import { GitInformation } from './GitInformation';
import { BuildInfo } from './BuildInfo';

export class AppInformation {
    private readonly gitInformation: GitInformation;
    private readonly buildInfo: BuildInfo;

    constructor(git: GitInformation, build: BuildInfo) {
        this.gitInformation = git;
        this.buildInfo = build;
    }

    getGitInfo(): GitInformation {
        return this.gitInformation;
    }

    getBuildInfo(): BuildInfo {
        return this.buildInfo;
    }
}