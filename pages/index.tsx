import Head from 'next/head'
import Workouts, { WorkoutData } from '../components/Workouts';
import { Container, Row, Col } from 'react-bootstrap';
import Header from '../components/header';
import Footer from '../components/footer';
import fs from 'fs'
import path from 'path'
import Papa from 'papaparse';

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
          <Col className='card'>
            <Workouts data={workouts}>

            </Workouts>
          </Col>
          <Col className='card'>
          </Col>
        </Row>
        <Row>
          <Col className='card'>
          </Col>
          <Col className='card'>
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
        a {
          color: inherit;
          text-decoration: none;
        }
        .title a {
          color: #0070f3;
          text-decoration: none;
        }
        .title a:hover,
        .title a:focus,
        .title a:active {
          text-decoration: underline;
        }
        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
        }
        .title,
        .description {
          text-align: center;
        }
        .description {
          line-height: 1.5;
          font-size: 1.5rem;
        }
        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }
        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          max-width: 800px;
          margin-top: 3rem;
        }
        .card {
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 30px;
          transition: color 0.15s ease, border-color 0.15s ease;
        }
        .card:hover,
        .card:focus,
        .card:active {
          color: #0070f3;
          border-color: #0070f3;
        }
        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }
        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }
        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }
        * {
          box-sizing: border-box;
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