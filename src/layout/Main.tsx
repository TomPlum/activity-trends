import Header from './Header';
import Footer from './Footer';
import Menu from './Menu';
import { Row, Col, Container } from 'react-bootstrap';
import styles from '../../assets/sass/components/layout/main.module.scss'

const MainLayout = ({ children }) => (
    <Container fluid className={styles.wrapper}>
        <Row>
            <Header/>
        </Row>
        <Row>
            <div className={styles.sidebar}>
                <Menu/>
            </div>
            <Col className={styles.content}>
                {children}
            </Col>
        </Row>

        <Footer lastDataUpdate='24/08/2020'/>
    </Container>
);

export default MainLayout;