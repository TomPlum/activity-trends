import { InfoConverter } from '../../converters/InfoConverter';
import { Info } from '../../types/Info';
import { GitInformation } from '../../domain/GitInformation';
import { AppInformation } from '../../domain/AppInformation';
import { BuildInfo } from '../../domain/BuildInfo';

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
                    id: {
                        describe: "",
                        abbrev: "7d42185",
                        full: "68f9b0ca2dc7dc8271b3b6052b5ee6ad5d5dc8e4"
                    },
                    time: 1603211976.000000000
                },
                build: {
                    version: "0.0.1-SNAPSHOT"
                }
            }
        }
    }

    function getExpectedTarget(): AppInformation {
        const gitInfo = new GitInformation("dev", "7d42185", "20/10/2020");
        const buildInfo = new BuildInfo("0.0.1-SNAPSHOT");
        return new AppInformation(gitInfo, buildInfo);
    }

});