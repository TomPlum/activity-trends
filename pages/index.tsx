import Head from 'next/head'
import { CardDeck, Card, Container, Row, Col } from 'react-bootstrap';
import styles from '../assets/css/components/index.module.css'
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import Menu from '../layout/Menu';
import { WorkoutData } from '../components/WorkoutTypes'
import fs from 'fs'
import path from 'path'
import Papa from 'papaparse';
import Workouts from './workouts';

interface HomeProps {
  workouts: WorkoutData[];
}

const Home: React.FC<HomeProps> = ({ workouts }) => {
  return (
    <div className="container">
      <Head>
        <title>Activity Trends</title>
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,500;1,700;1,900&display=swap" rel="stylesheet"></link>
      </Head>

      <Header></Header>

      <Container fluid>
        <Row>
          <Col xs={3} className={styles.menu}>
            <Menu />
          </Col>
          <Col xs={9} className={styles.content}>
            <Workouts workouts={workouts}></Workouts>
          </Col>
        </Row>
      </Container>

      <Footer lastDataUpdate='24/08/2020'></Footer>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
      `}</style>


    </div>
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

export default Home;