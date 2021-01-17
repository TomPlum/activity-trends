import { GitInformation } from '../../domain/GitInformation';

describe('Git Information', () => {

    const info = new GitInformation("dev", "7d42185", "2020-10-16T17:33:24Z");

    describe('Getters', () => {
        it('Should get the branch name', () => {
            expect(info.getBranch()).toBe("dev");
        });

        it('Should get the commit hash', () => {
            expect(info.getHash()).toBe('7d42185');
        });

        it('Should get the date/time of the last commit', () => {
            expect(info.getDate()).toBe('2020-10-16T17:33:24Z');
        });
    });

    describe('URIs', () => {
        it('Should get the URI to the latest commit hash on GitHub', () => {
            expect(info.getCommitURI()).toBe('https://github.com/TomPlum/activity-trends-api/commit/7d42185');
        });

        it('Should get the URI to the latest commits branch on GitHub', () => {
            expect(info.getBranchURI()).toBe('https://github.com/TomPlum/activity-trends-api/tree/dev');
        });
    });
    
});