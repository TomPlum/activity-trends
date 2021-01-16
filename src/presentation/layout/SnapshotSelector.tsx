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
}

class SnapshotSelector extends Component<{}, SnapshotSelectorState> {
    constructor(props) {
        super(props);

        this.state = {
            data: new SnapshotDates(),
            selected: "Snapshot",
            isDisabled: false,
        }
    }

    select = (snapshot) => {
        this.setState({ selected: snapshot, isDisabled: true });
        this.setState({ isDisabled: false });
    }

    async componentDidMount() {
        await new ActivityTrendsService().getSnapshotDates()
               .then((data) => this.setState({ data }))
               .catch(error => this.setState({ isDisabled: true }));
    }

    render() {
        const { isDisabled, selected } = this.state;
        const mostRecent = "Stubbed"

        return (
            <NavDropdown title={this.getTitle()} id="snapshot-dropdown" className={styles.snapshot} onSelect={this.select} disabled={isDisabled}>
                <NavDropdown.Item className={styles.selected} key={mostRecent} eventKey={mostRecent}> Most Recent </NavDropdown.Item>
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