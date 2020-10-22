import Header from './Header';
import Footer from './Footer';
import Menu from './Menu';
import { Row, Col, Container } from 'react-bootstrap';
import { SnapshotDates } from '../domain/SnapshotDates';
import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Sleep from '../pages/Sleep';
import Overview from "../pages/Overview";
import Running from "../pages/Running";
import Gym from "../pages/Gym";
import styles from '../assets/sass/components/layout/Main.module.scss'

class MainLayout extends Component {
    render() {
        return (
            <Container fluid className={styles.wrapper}>
                <Row className={styles.row}>
                    <Header />
                </Row>

                <Row className={styles.row}>
                    <div className={styles.sidebar}>
                        <Menu />
                    </div>
                    <Col className={styles.content}>
                        <Switch>
                            <Route path='/' exact component={Overview}/>
                            <Route path='/running' exact component={Running}/>
                            <Route path='/gym' component={Gym}/>
                            <Route path='/sleep' component={Sleep}/>
                        </Switch>
                    </Col>
                </Row>

                <Footer />
            </Container>
        );
    }
}

export default MainLayout;