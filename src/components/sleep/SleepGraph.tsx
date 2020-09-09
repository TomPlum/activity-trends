import { Component } from 'react';
import moment from 'moment';
import { Card, Col, Row } from 'react-bootstrap';
import SleepQualityPieChart, { SleepQualityPieChartData } from "./SleepQualityPieChart";
import GraphTypeButton from './GraphTypeButton';
import { GraphType } from '../../types/GraphType';
import SleepScatterGraph from './SleepScatterGraph';
import SleepAreaGraph from './SleepAreaGraph';
import Info from './Info';
import MiscInfo, { MiscInfoData } from './MiscInfo';
import { Mood } from './Mood';

interface SleepGraphMainProps {
    data: SleepGraphMainData[]
}

interface SleepGraphState {
    selectedSessionData: SleepQualityPieChartData;
    selectedSessionMiscInfo: MiscInfoData;
    selectedSessionDate: string;
    selectedGraphType: GraphType;
}

export interface SleepGraphMainData {
    date: string,
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
        this.handleGraphTypeChange = this.handleGraphTypeChange.bind(this);
        this.state = {
            selectedSessionData: this.getMostRecentSleepSession(),
            selectedSessionMiscInfo: this.getMostRecentSleepSession(),
            selectedSessionDate: this.getMostRecentDate(),
            selectedGraphType: GraphType.SCATTER
        }
    }

    onClickSleepSession = (response) => {
        this.setState({
            selectedSessionData: response.data,
            selectedSessionDate: response.date,
            selectedSessionMiscInfo: {
                soundsRecorded: response.data.soundsRecorded,
                mood: response.data.mood
            }
        });
    }

    handleGraphTypeChange = (option) => this.setState({ selectedGraphType: option });


    render() {
        return (
            <>
                <Card>
                    <Card.Body>
                        <Card.Title>Sleep Quality vs Duration
                            <Info text="Click a data point on the graph to display that session in detail below." />
                            <GraphTypeButton
                                options={[GraphType.SCATTER, GraphType.AREA]}
                                onChange={this.handleGraphTypeChange}
                            />
                        </Card.Title>
                        {this.LeadingGraph()}
                    </Card.Body>
                </Card>
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
                                <MiscInfo data={this.state.selectedSessionMiscInfo}/>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

            </>
        )
    }

    private formatDateTitle(): string {
        return moment(this.state.selectedSessionDate).format("dddd Do MMMM YYYY")
    }

    private getMostRecentSleepSession(): SleepGraphMainData {
        const data = this.props.data;
        return data.find(d => d.date = this.getMostRecentDate());
    }

    private getMostRecentDate(): string {
        return moment.max(this.props.data.map(d => moment(d.date))).toString();
    }

    private LeadingGraph() {
        const { data } = this.props;

        switch (this.state.selectedGraphType) {
            case GraphType.SCATTER: {
                return <SleepScatterGraph data={data} onSelectedSession={this.onClickSleepSession} />
            }
            case GraphType.AREA: {
                return <SleepAreaGraph data={data} onSelectedSession={this.onClickSleepSession} />
            }
        }
    }
}

export default SleepGraph;