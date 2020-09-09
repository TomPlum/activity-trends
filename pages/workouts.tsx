import { CardDeck, Card } from 'react-bootstrap';
import styles from '../assets/sass/pages/workouts.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDumbbell, faHamburger, faClock } from '@fortawesome/free-solid-svg-icons';
import WorkoutTypes, { WorkoutData } from '../src/components/WorkoutTypes';
import DataRepository from '../src/repository/DataRepository';

export interface WorkoutsProps {
    workouts: WorkoutData[]
}

const Workouts: React.FunctionComponent<WorkoutsProps> = ({ workouts }) => {
    return (
        <CardDeck>
            <Card className={styles.card}>
                <Card.Body>
                    <Card.Title className={styles.title}>
                        <FontAwesomeIcon icon={faDumbbell} size="xs" fixedWidth /> Workouts
                  </Card.Title>
                    <WorkoutTypes data={workouts}></WorkoutTypes>
                </Card.Body>
                <Card.Footer className={styles.footer}>
                    {workouts.length} workouts recorded
                </Card.Footer>
            </Card>

            <Card className={styles.card}>
                <Card.Body>
                    <Card.Title className={styles.title}>
                        <FontAwesomeIcon icon={faClock} size="xs" fixedWidth /> Duration
                    </Card.Title>
                </Card.Body>
                <Card.Footer className={styles.footer}>
                    Total workout time is x
                </Card.Footer>
            </Card>


            <Card className={styles.card}>
                <Card.Body>
                    <Card.Title className={styles.title}>
                        <FontAwesomeIcon icon={faHamburger} size="xs" fixedWidth /> Calories
                    </Card.Title>
                </Card.Body>
                <Card.Footer className={styles.footer}>
                    Total calories burnt is x
                </Card.Footer>
            </Card>
        </CardDeck>
    )
}

export async function getStaticProps() {
    const csv = new DataRepository().read('workouts.csv', ',')

    return {
        props: {
            workouts: csv
        }
    }
}

export default Workouts;