import { GitCommitInfo, GitInfo, Info } from '../types/Info';
import { GitInformation } from '../domain/GitInformation';
import { AppInformation } from '../domain/AppInformation';
import { BuildInfo } from '../domain/BuildInfo';
import moment from "moment";

export class InfoConverter {
    convert(data: Info): AppInformation {
        const git = data.git;
        const gitInfo = InfoConverter.getGitInformation(git);

        const build = git.build;
        const buildInfo = new BuildInfo(build.version);

        return new AppInformation(gitInfo, buildInfo);
    }

    private static getGitInformation(git: GitInfo): GitInformation {
        const commit = git.commit;
        const time = moment.unix(commit.time).format("DD/MM/YYYY")
        return new GitInformation(git.branch, commit.id.abbrev, time);
    }
}