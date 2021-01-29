import React, { Component } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { faBed, faClock, faMicrophone, faSmile } from '@fortawesome/free-solid-svg-icons';
import SleepGraph, { SleepGraphMainData } from '../components/sleep/graphs/SleepGraph';
import LoadingSpinner from '../layout/LoadingSpinner';
import SleepInfoCard from '../components/sleep/SleepInfoCard';
import { SleepService } from '../../application/service/SleepService';
import DisabledOverlay from "../layout/DisabledOverlay";
import styles from '../../assets/sass/pages/Sleep.module.scss';

interface SleepState {
  sleepData: SleepGraphMainData[]
  loading: boolean;
}

class Sleep extends Component<{}, SleepState> {
  constructor(props) {
    super(props);
    this.state = {
      sleepData: undefined,
      loading: true
    }
  }

  async componentDidMount() {
    this.setState({loading: true});
    const data = await new SleepService().initialise();
    this.setState({sleepData: data, loading: false});
  }

  render() {
    const { sleepData, loading } = this.state

    return (
      <Container fluid className={"page-container"}>
        <LoadingSpinner active={loading}/>
        <DisabledOverlay active={!loading && !sleepData}/>
        <p className={styles.desc}>Visualising the data recorded by the iOS
          <a href={"https://pillow.app/"} target={"_blank"} rel={"noreferrer noopener"} className={styles.link}> Pillow </a>
          app from my Apple watch.
        </p>

        <Row>
          <Col xl={3} md={6} sm={6} xs={12}>
            <SleepInfoCard title="Sessions" value={this.getSleepSessionQuantity()} icon={faBed}/>
          </Col>
          <Col xl={3} md={6} sm={6} xs={12}>
            <SleepInfoCard title="Avg Quality" value={this.getAvgSleepQuality()} unit="%" icon={faSmile}/>
          </Col>
          <Col xl={3} md={6} sm={6} xs={12}>
            <SleepInfoCard title="Hours Slept" value={this.getTotalHoursSlept()} icon={faClock}/>
          </Col>
          <Col xl={3} md={6} sm={6} xs={12}>
            <SleepInfoCard title="Sounds Rec." value={this.getSoundsSum()} icon={faMicrophone}/>
          </Col>
        </Row>

        <SleepGraph key={"" + loading} data={sleepData}/>
      </Container>
    )
  }

  private getAvgSleepQuality(): number {
    const {sleepData} = this.state;
    if (!sleepData) return 0;
    let sum = this.state.sleepData.map(e => e.sleepQuality).reduce((sum, val) => sum + val, 0);
    return Number((sum / this.getSleepSessionQuantity()).toFixed(1));
  }

  private getSleepSessionQuantity(): number {
    const {sleepData} = this.state;
    return sleepData ? sleepData.length : 0;
  }

  private getTotalHoursSlept(): number {
    const {sleepData} = this.state;
    if (!sleepData) return 0;
    const hours = sleepData.map(e => e.duration).reduce((sum, val) => sum + val, 0);
    return Math.round(hours);
  }

  private getSoundsSum(): number {
    const {sleepData} = this.state;
    if (!sleepData) return 0;
    const sounds = sleepData.map(it => it.soundsRecorded).reduce((sum, val) => sum + val, 0);
    return Math.round(sounds);
  }
}

export default Sleep;