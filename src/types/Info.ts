export interface Info {
    git: GitInfo;
}

export interface GitInfo {
    branch: string;
    commit: GitCommitInfo;
    build: GitBuildInfo;
}

export interface GitCommitInfo {
    id: string;
    time: string;
}

export interface GitBuildInfo {
    version: string;
}