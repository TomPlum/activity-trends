import React, { Component } from 'react';
import Header from './Header';
import Footer from './Footer';
import Menu from './Menu';
import { Col, Container, Row } from 'react-bootstrap';
import { Switch } from 'react-router-dom';
import Sleep from '../pages/Sleep';
import Overview from "../pages/Overview";
import Cardio from "../pages/Cardio";
import Gym from "../pages/Gym";
import NotFound from "../pages/NotFound";
import ProgressRoute from "../components/ProgressRoute";
import styles from '../../assets/sass/components/layout/Main.module.scss'

class MainLayout extends Component {
  render() {
    return (
      <Container fluid className={styles.wrapper}>
        <Row className={styles.row}>
          <Header/>
        </Row>

        <Row className={styles.row}>
          <div className={styles.sidebar}>
            <Menu/>
          </div>
          <Col className={styles.content}>
            <div className={styles.contentWrapper}>
              <Switch>
                <ProgressRoute path='/' component={Overview} exact/>
                <ProgressRoute path='/cardio' component={Cardio}/>
                <ProgressRoute path='/gym' component={Gym}/>
                <ProgressRoute path='/sleep' component={Sleep}/>
                <ProgressRoute component={NotFound}/>
              </Switch>
            </div>
          </Col>
        </Row>

        <Footer/>
      </Container>
    );
  }
}

export default MainLayout;