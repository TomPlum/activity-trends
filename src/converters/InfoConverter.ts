import { Info } from '../types/Info';
import { GitInformation } from '../domain/GitInformation';

export class InfoConverter {
    convert(data: Info): GitInformation {
        const git = data.git;
        const commit = git.commit;
        return new GitInformation(git.branch, commit.id, commit.time);
    }
}