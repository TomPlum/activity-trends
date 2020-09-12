import fs from 'fs'
import path from 'path'
import Papa from 'papaparse';

class CsvFileReader {
    private readonly dataDirectory = path.join(process.cwd(), 'public/data')

    read(fileName: string, delimiter: string): unknown[] {
        
        const result = Papa.parse(this.getFileContents(fileName), {
            delimiter: delimiter,
            header: true,
            skipEmptyLines: true,
            complete: results => {
                return results.data
            }
        });

        if (result.errors) {
            result.errors.forEach(e => {
                console.log(e);
            });
        }

        return result.data;
    }

    private getFileContents(fileName: string) {
        const filenames = fs.readdirSync(this.dataDirectory)
        const file = filenames.find(e => e === fileName);

        if (!file) {
            throw new ReferenceError('Unknown File: ' + fileName)
        }
        const filePath = path.join(this.dataDirectory, file)
        return fs.readFileSync(filePath, 'utf8')
    }
}

export default CsvFileReader;