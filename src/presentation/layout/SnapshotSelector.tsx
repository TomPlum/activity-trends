import { NavDropdown } from 'react-bootstrap';
import React, { Component } from 'react';
import { Page } from '../../domain/Page';
import { SnapshotDates } from '../../domain/SnapshotDates';
import styles from '../../assets/sass/components/layout/SnapshotSelector.module.scss'
import { ActivityTrendsService } from "../../application/service/ActivityTrendsService";

interface SnapshotSelectorState {
    data: SnapshotDates;
    selected: string;
    isDisabled: boolean;
    error: Error;
}

class SnapshotSelector extends Component<{}, SnapshotSelectorState> {
    constructor(props) {
        super(props);

        this.state = {
            data: new SnapshotDates(),
            selected: "Snapshot",
            isDisabled: false,
            error: null
        }
    }

    select = (snapshot) => {
        this.setState({ selected: snapshot, isDisabled: true });
        this.setState({ isDisabled: false });
    }

    async componentDidMount() {
        try {
            const data = await new ActivityTrendsService().getSnapshotDates();
            this.setState({ data });
        } catch (e) {
            this.setState({ error: e })
        }
    }

    render() {
        const { isDisabled, selected, error } = this.state;
        const mostRecent = "Stubbed"

        if (error) throw error;

        return (
            <NavDropdown title={this.getTitle()}
                         id="snapshot-dropdown"
                         className={styles.snapshot}
                         onSelect={this.select}
                         disabled={isDisabled}
            >
                <NavDropdown.Item className={styles.selected} key={mostRecent} eventKey={mostRecent}>
                    Most Recent
                </NavDropdown.Item>

                <NavDropdown.Divider/>

                {
                    this.state.data.getDates(Page.SLEEP).map(date => {
                        return (
                            <NavDropdown.Item className={styles.date} key={date} eventKey={date} disabled={selected === date}>
                                {date}
                            </NavDropdown.Item>
                        )
                    })
                }
            </NavDropdown>
        );
    }

    private getTitle() {
        const { selected } = this.state;
        return this.context.latest === selected ? "Snapshot" : selected;
    }
}

export default SnapshotSelector;