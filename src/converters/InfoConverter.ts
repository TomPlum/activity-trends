import { Info } from '../types/Info';
import { GitInformation } from '../domain/GitInformation';
import { AppInformation } from '../domain/AppInformation';
import { BuildInfo } from '../domain/BuildInfo';

export class InfoConverter {
    convert(data: Info): AppInformation {
        const git = data.git;
        const commit = git.commit;
        const gitInfo = new GitInformation(git.branch, commit.id, commit.time);

        const build = git.build;
        const buildInfo = new BuildInfo(build.version);

        return new AppInformation(gitInfo, buildInfo);
    }
}