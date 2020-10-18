import { InfoConverter } from '../../src/converters/InfoConverter';
import { Info } from '../../src/types/Info';
import { GitInformation } from '../../src/domain/GitInformation';
import { AppInformation } from '../../src/domain/AppInformation';
import { BuildInfo } from '../../src/domain/BuildInfo';

describe('Info Converter', () => {

    const converter = new InfoConverter();

    it('Should Convert Valid Response Data', () => {
        const source = getSource();
        const target = converter.convert(source);
        expect(target).toEqual(getExpectedTarget());
    });

    function getSource(): Info {
        return {
            git: {
                branch: "dev",
                commit: {
                    id: "7d42185",
                    time: "2020-10-16T17:33:24Z"
                },
                build: {
                    version: "0.0.1-SNAPSHOT"
                }
            }
        }
    }

    function getExpectedTarget(): AppInformation {
        const gitInfo = new GitInformation("dev", "7d42185", "2020-10-16T17:33:24Z");
        const buildInfo = new BuildInfo("0.0.1-SNAPSHOT");
        return new AppInformation(gitInfo, buildInfo);
    }

});

export default describe;