import Header from './Header';
import Footer from './Footer';
import Menu from './Menu';
import { Row, Col, Container } from 'react-bootstrap';
import { SnapshotDates } from '../domain/SnapshotDates';
import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import { AppInformation } from '../domain/AppInformation';
import styles from '../assets/sass/components/layout/Main.module.scss'
import Sleep from '../pages/Sleep';
import Switch from 'react-bootstrap/esm/Switch';

interface MainLayoutProps {
    snapshotDates: SnapshotDates;
    appInfo: AppInformation;
}

class MainLayout extends Component<MainLayoutProps> {
    render() {
        const { snapshotDates, appInfo } = this.props;

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
                        <Switch>
                            <Route path='/sleep' exact component={Sleep}/>
                        </Switch>
                    </Col>
                </Row>

                <Footer />
            </Container>
        );
    }
}

export default MainLayout;