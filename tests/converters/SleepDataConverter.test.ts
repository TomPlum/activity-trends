import SleepDataConverter from '../../src/converters/SleepDataConverter';
import { Mood } from '../../src/components/sleep/Mood';

const converter = new SleepDataConverter();

describe('Convert', () => {
    const csv = [{
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
    }];

    test('Start Time', () => expect(converter.convert(csv)[0].startDate).toBe('2018-08-21 21:44:03 +0000'));
    test('End Time', () => expect(converter.convert(csv)[0].endDate).toBe('2018-08-22 06:00:56 +0000'));
    test('Duration', () => expect(converter.convert(csv)[0].duration).toBe(497));
    test('Nap', () => expect(converter.convert(csv)[0].isNap).toBe(false));
    test('Sleep Quality', () => expect(converter.convert(csv)[0].sleepQuality).toBe(60));
    test('Awake Time', () => expect(converter.convert(csv)[0].awakeTime).toBe(127));
    test('REM Sleep', () => expect(converter.convert(csv)[0].remSleep).toBe(70));
    test('Light Sleep', () => expect(converter.convert(csv)[0].lightSleep).toBe(150));
    test('Deep Sleep', () => expect(converter.convert(csv)[0].deepSleep).toBe(150));
    test('Sounds Recorded', () => expect(converter.convert(csv)[0].soundsRecorded).toBe(11));
    test('Wake Up Mood', () => expect(converter.convert(csv)[0].mood).toBe('N/A'));
});

describe('Convert To Main Graph Data', () => {
    const data = [{
        startDate: '2018-08-21 21:44:03 +0000',
        endDate: '2018-08-22 06:00:56 +0000',
        duration: 497,
        isNap: false,
        sleepQuality: 60,
        awakeTime: 127,
        remSleep: 70,
        lightSleep: 150,
        deepSleep: 150,
        soundsRecorded: 11,
        mood: 'N/A'
    }];

    test('Date', () => expect(converter.convertToMainGraphData(data)[0].date).toBe('2018-08-21 21:44:03'));
    test('Start Time', () => expect(converter.convertToMainGraphData(data)[0].startTime).toBe('21:44'));
    test('End Time', () => expect(converter.convertToMainGraphData(data)[0].endTime).toBe('06:00'));
    test('Duration', () => expect(converter.convertToMainGraphData(data)[0].duration).toBeCloseTo(8.283));
    test('Sleep Quality', () => expect(converter.convertToMainGraphData(data)[0].sleepQuality).toBe(60));
    test('Nap', () => expect(converter.convertToMainGraphData(data)[0].isNap).toBe(false));
    test('Awake Time', () => expect(converter.convertToMainGraphData(data)[0].awakeTime).toBeCloseTo(2.116));
    test('REM Sleep', () => expect(converter.convertToMainGraphData(data)[0].remSleep).toBeCloseTo(1.166));
    test('Deep Sleep', () => expect(converter.convertToMainGraphData(data)[0].deepSleep).toBe(2.5));
    test('Light Sleep', () => expect(converter.convertToMainGraphData(data)[0].lightSleep).toBe(2.5));
    test('Sounds Recorded', () => expect(converter.convertToMainGraphData(data)[0].soundsRecorded).toBe(11));
    test('Wake Up Mood', () => expect(converter.convertToMainGraphData(data)[0].mood).toBe(Mood.UNKNOWN));
});

export default describe;