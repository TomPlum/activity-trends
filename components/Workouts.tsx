import { Container } from 'react-bootstrap'

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

const Workouts: React.FunctionComponent<WorkoutsProps> = ({data}) => {
    return (
        <Container>
            <p>{data.length} workouts recorded.</p>
            <p>{extractWorkoutTypes(data)}</p>
        </Container>
    )
}

function extractWorkoutTypes(data) {
    return data.map(datum => {return datum["Type"]});
}

export default Workouts;