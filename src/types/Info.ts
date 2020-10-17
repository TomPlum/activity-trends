export interface Info {
    git: GitInfo;
}

export interface GitInfo {
    branch: string;
    commit: GitCommitInfo;
}

export interface GitCommitInfo {
    id: string;
    time: string;
}