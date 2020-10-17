import { InfoConverter } from '../../src/converters/InfoConverter';
import { Info } from '../../src/types/Info';
import { GitInformation } from '../../src/domain/GitInformation';
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
                }
            }
        }
    }

    function getExpectedTarget(): GitInformation {
        return new GitInformation("dev", "7d42185", "2020-10-16T17:33:24Z");
    }

});

export default describe;