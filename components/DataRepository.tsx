import { Component } from "react";

import fs from 'fs'
import path from 'path'
import Papa from 'papaparse';

class DataRepository {

    read(fileName: string): Papa.ParseResult<any> {
        const dataDirectory = path.join(process.cwd(), 'public/data')
        const filenames = fs.readdirSync(dataDirectory)

        const file = filenames[fileName];
        
        const filePath = path.join(dataDirectory, file)
        const fileContents = fs.readFileSync(filePath, 'utf8')
        return Papa.parse(fileContents, {
            delimiter: ',',
            header: true,
            complete: results => {
                return results.data
            }
        })
    }
}

export default DataRepository;