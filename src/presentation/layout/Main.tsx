import React, { Component } from 'react';
import Header from './Header';
import Footer from './Footer';
import Menu from './Menu';
import { Row, Col, Container } from 'react-bootstrap';
import { Switch } from 'react-router-dom';
import Sleep from '../pages/Sleep';
import Overview from "../pages/Overview";
import Running from "../pages/Running";
import Gym from "../pages/Gym";
import styles from '../../assets/sass/components/layout/Main.module.scss'
import ProgressRoute from "../components/ProgressRoute";

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
                            <ProgressRoute path='/' component={Overview} exact />
                            <ProgressRoute path='/running' component={Running} />
                            <ProgressRoute path='/gym' component={Gym} />
                            <ProgressRoute path='/sleep' component={Sleep} />
                        </Switch>
                    </Col>
                </Row>

                <Footer />
            </Container>
        );
    }
}

export default MainLayout;