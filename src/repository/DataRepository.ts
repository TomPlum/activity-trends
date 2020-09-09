import fs from 'fs'
import path from 'path'
import Papa from 'papaparse';

class DataRepository {

    read(fileName: string, delimiter: string): unknown[] {
        const dataDirectory = path.join(process.cwd(), 'public/data')
        const filenames = fs.readdirSync(dataDirectory)

        const file = filenames.find(e => e === fileName);
        if (!file) {
            throw new ReferenceError('Unknown File: ' + fileName)
        }
        
        const filePath = path.join(dataDirectory, file)
        const fileContents = fs.readFileSync(filePath, 'utf8')
        const result = Papa.parse(fileContents, {
            delimiter: delimiter,
            header: true,
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
}

export default DataRepository;