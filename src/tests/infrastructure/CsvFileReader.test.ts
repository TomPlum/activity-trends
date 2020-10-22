import CsvFileReader from '../../infrastructure/CsvFileReader';

const reader = new CsvFileReader();

describe('Valid Scenarios', () => {
    test('valid csv file is read successfully', () => {
        const result = reader.read('sleep.csv', ', ');
        const expected = {
            'Start Time': '2018-08-21 21:44:03 +0000',
            'End Time': '2018-08-22 06:00:56 +0000',
            'Duration (mins)': '497',
            'Nap': 'NO',
            'Sleep Quality (%)': '60',
            'Time Awake (mins)': '127',
            'Time in REM Slep (mins)': '70',
            'Time in Light Sleep (mins)': '150',
            'Time In Deep Sleep (mins)': '150',
            'Sounds Recorded': '11',
            'Wake-up mood': 'N/A',
            '': ''
        }
        expect(result[30]).toStrictEqual(expected);
    });
});

describe('Invalid Scenarios', () => {
    test('invalid file name', () => {
        expect(() => reader.read('test.csv', ',')).toThrowError(new ReferenceError('Unknown File: test.csv'));
    });
});

export default describe;