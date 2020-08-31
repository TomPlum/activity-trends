import { CardDeck, Card} from 'react-bootstrap';
import styles from '../assets/css/pages/workouts.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as icons from '@fortawesome/free-solid-svg-icons';
import WorkoutTypes, { WorkoutData } from '../components/WorkoutTypes';

export interface WorkoutsProps {
    workouts: WorkoutData[]
}

const Workouts: React.FunctionComponent<WorkoutsProps> = ({ workouts }) => {
    return (
        <CardDeck>
            <Card className={styles.card}>
                <Card.Body>
                    <Card.Title className={styles.title}>
                        <FontAwesomeIcon icon={icons.faDumbbell} size="xs" fixedWidth /> Workouts
                  </Card.Title>
                    <WorkoutTypes data={workouts}></WorkoutTypes>
                </Card.Body>
                <Card.Footer className={styles.footer}>
                    {workouts.length} workouts recorded
                </Card.Footer>
            </Card>
        </CardDeck>
    )
}

export default Workouts;