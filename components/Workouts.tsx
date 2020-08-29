import { Container } from 'react-bootstrap'
import { PieChart, Pie, Sector, Cell } from 'recharts'

interface WorkoutsProps {
    data: WorkoutData[]
}

export interface WorkoutData {
    'Type': string,
    'Start': string,
    'End': string,
    'Duration': string,
    'Distance': string,
    'Average Heart Rate': string,
    'Max Heart Rate': string,
    'Average Pace': string,
    'Average Speed': string,
    'Active Energy': string,
    'Total Energy': string,
    'Elevation Ascended': string,
    'Elevation Descended': string,
    'Weather Temperature': string,
    'Weeather Humidity': string
}

const Workouts: React.FunctionComponent<WorkoutsProps> = ({ data }) => {
    return (
        <Container>
            <p>{data.length} workouts recorded.</p>
            <PieChart width={800} height={400}>
                <Pie
                    data={extractWorkoutTypes(data)}
                    nameKey="name"
                    dataKey="value"
                    labelLine={false}
                    //label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                >
                </Pie>
            </PieChart>
        </Container>
    )
}

function extractWorkoutTypes(data: WorkoutData[]) {
    let counts = {};
    const types = data.map(datum => { return datum["Type"] });
    for (var i = 0; i < types.length; i++) {
        var num = types[i];
        counts[num] = (counts[num] || 0) + 1
    }
    const uniqueTypes = types.filter((v, i, self) => {return self.indexOf(v) === i})
    const result = uniqueTypes.map(type => {
        return {
            name: type,
            value: counts[type]
        }
    });
    return result;
}

export default Workouts;