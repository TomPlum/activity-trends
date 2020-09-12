import { Component } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import SleepQualityPieChart, { SleepQualityPieChartData } from "./SleepQualityPieChart";
import GraphTypeButton from '../GraphTypeButton';
import { GraphType } from '../../../types/GraphType';
import SleepScatterGraph from './SleepScatterGraph';
import SleepAreaGraph from './SleepAreaGraph';
import Info from '../Info';
import MiscInfo, { MiscInfoData } from '../MiscInfo';
import { Mood } from '../../../types/Mood';
import moment from 'moment';
import SleepBarGraph from './SleepBarGraph';

interface SleepGraphMainProps {
    data: SleepGraphMainData[]
}

interface SleepGraphState {
    selectedSessionData: SleepQualityPieChartData;
    selectedSession: SelectedSessionInfo;
    selectedGraphType: GraphType;
}

interface SelectedSessionInfo {
    date: string,
    startTime: string,
    endTime: string,
    miscInfo: MiscInfoData
}

export interface SleepGraphMainData {
    date: string,
    startTime: string,
    endTime: string,
    duration: number,
    sleepQuality: number,
    isNap: boolean,
    awakeTime: number,
    lightSleep: number,
    deepSleep: number,
    remSleep: number,
    soundsRecorded: number,
    mood: Mood
}

class SleepGraph extends Component<SleepGraphMainProps, SleepGraphState> {
    constructor(props) {
        super(props);
        this.state = {
            selectedSessionData: this.getMostRecentSleepSessionData(),
            selectedSession: this.getMostRecentSleepSession(),
            selectedGraphType: GraphType.AREA
        }
    }

    onClickSleepSession = (response) => {
        const { data, date, startTime, endTime, soundsRecorded, duration, mood } = response;
        this.setState({
            selectedSessionData: data,
            selectedSession: {
                date,
                startTime,
                endTime,
                miscInfo: {
                    soundsRecorded,
                    mood,
                    duration
                }
            },
        });
    }

    handleGraphTypeChange = (option) => this.setState({ selectedGraphType: option });

    render() {
        return (
            <>
                <Row>
                    <Col xs={12}>
                        <Card>
                            <Card.Body>
                                <Card.Title> Sleep Quality vs Duration
                                    <Info text="Click a data point on the graph to display that session in detail below." />
                                    <GraphTypeButton
                                        options={[GraphType.SCATTER, GraphType.AREA, GraphType.BAR]}
                                        onChange={this.handleGraphTypeChange}
                                        default={this.state.selectedGraphType}
                                    />
                                </Card.Title>
                                {this.renderLeadingGraph()}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row>
                    <Col md={6} sm={12}>
                        <Card>
                            <Card.Body>
                                <Card.Title>{this.formatDateTitle()}</Card.Title>
                                <SleepQualityPieChart data={this.state.selectedSessionData} />
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} sm={12}>
                        <Card>
                            <Card.Body>
                                <Card.Title>Miscellaneous Information</Card.Title>
                                <MiscInfo data={this.state.selectedSession.miscInfo} />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </>
        )
    }

    private formatDateTitle(): string {
        const { date, startTime, endTime } = this.state.selectedSession;
        return moment(date).format("dddd Do MMMM YYYY") + " (" + startTime + " - " + endTime + ")";
    }

    private getMostRecentSleepSessionData(): SleepGraphMainData {
        return this.props.data.find(d => d.date == this.getMostRecentSleepSession().date);
    }

    private getMostRecentSleepSession(): SelectedSessionInfo {
        const sessionData = this.props.data.reduce((a, b) => (new Date(a.date) > new Date(b.date) ? a : b));
        const { date, startTime, endTime, soundsRecorded, mood, duration } = sessionData;
        return { date, startTime, endTime, miscInfo: { soundsRecorded, mood, duration } };
    }

    private renderLeadingGraph() {
        const { data } = this.props;

        switch (this.state.selectedGraphType) {
            case GraphType.SCATTER: {
                return <SleepScatterGraph data={data} onSelectedSession={this.onClickSleepSession} />
            }
            case GraphType.AREA: {
                return <SleepAreaGraph data={data} onSelectedSession={this.onClickSleepSession} />
            }
            case GraphType.BAR: {
                return <SleepBarGraph data={data} onSelectedSession={this.onClickSleepSession} />
            }
        }
    }
}

export default SleepGraph;