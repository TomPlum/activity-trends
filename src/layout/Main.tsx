import Header from './Header';
import Footer from './Footer';
import Menu from './Menu';
import { Row, Col, Container } from 'react-bootstrap';
import styles from '../../assets/sass/components/layout/Main.module.scss'
import { SnapshotDates } from '../domain/SnapshotDates';
import { BuildInfo } from '../domain/BuildInfo';

interface MainLayoutProps {
    snapshotDates: SnapshotDates;
    appInfo: BuildInfo;
}

function MainLayout({ snapshotDates, appInfo, children }) {
    return (
        <Container fluid className={styles.wrapper}>
            <Row className={styles.row}>
                <Header snapshotDates={snapshotDates} appInfo={appInfo} />
            </Row>
            <Row className={styles.row}>
                <div className={styles.sidebar}>
                    <Menu />
                </div>
                <Col className={styles.content}>
                    {children}
                </Col>
            </Row>

            <Footer lastDataUpdate={"Stubbed for now"} />
        </Container>
    );
}

export default MainLayout;