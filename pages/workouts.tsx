import { CardDeck, Card } from 'react-bootstrap';
import styles from '../assets/css/pages/workouts.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDumbbell, faHamburger, faClock } from '@fortawesome/free-solid-svg-icons';
import WorkoutTypes, { WorkoutData } from '../components/WorkoutTypes';
import fs from 'fs'
import path from 'path'
import Papa from 'papaparse';

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
    const dataDirectory = path.join(process.cwd(), 'public/data')
    const filenames = fs.readdirSync(dataDirectory)

    const parsed = filenames.map((filename) => {
        const filePath = path.join(dataDirectory, filename)
        const fileContents = fs.readFileSync(filePath, 'utf8')
        return Papa.parse(fileContents, {
            delimiter: ',',
            header: true,
            complete: results => {
                return results.data
            }
        })
    });

    return {
        props: {
            workouts: parsed[0].data
        }
    }
}

export default Workouts;