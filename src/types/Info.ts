export interface Info {
    git: GitInfo;
}

export interface GitInfo {
    branch: string;
    commit: GitCommitInfo;
    build: GitBuildInfo;
}

export interface GitCommitInfo {
    id: GitCommitID;
    time: string;
}

export interface GitCommitID {
    describe: string;
    abbrev: string;
    full: string;
}

export interface GitBuildInfo {
    version: string;
}