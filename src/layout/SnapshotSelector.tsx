import { NavDropdown } from 'react-bootstrap';
import React, { Component } from 'react';
import { Page } from '../domain/Page';
import { SnapshotDates } from '../domain/SnapshotDates';
import SnapshotContextProvider from '../infrastructure/context/SnapshotContextProvider';
import { SnapshotContext } from '../infrastructure/context/SnapshotContextProvider';
import styles from '../assets/sass/components/layout/SnapshotSelector.module.scss'

interface SnapshotSelectorProps {
    snapshotDates: SnapshotDates;
}

interface SnapshotSelectorState {
    selected: string;
    isDisabled: boolean;
    snapshotDates: SnapshotDates;
}

class SnapshotSelector extends Component<SnapshotSelectorProps, SnapshotSelectorState> {
    constructor(props) {
        super(props);
        this.state = this.select.bind(this);
        this.state = {
            selected: "Snapshot",
            isDisabled: false,
            snapshotDates: new SnapshotDates()
        }
    }

    select = (snapshot) => {
        this.setState({ selected: snapshot, isDisabled: true });
        this.setState({ isDisabled: false });
    }

    render() {
        const { isDisabled, selected } = this.state;
        const mostRecent = "Stubbed"

        return (
            <>
                <SnapshotContextProvider setSelected={this.state.selected} />
                <NavDropdown title={this.getTitle()} id="snapshot-dropdown" className={styles.snapshot} onSelect={this.select} disabled={isDisabled}>
                    <NavDropdown.Item className={styles.selected} key={mostRecent} eventKey={mostRecent}>
                        Most Recent
                </NavDropdown.Item>
                    <NavDropdown.Divider />
                    {
                        this.state.snapshotDates.getDates(Page.SLEEP).map(date => {
                            return (
                                <NavDropdown.Item className={styles.date} key={date} eventKey={date} disabled={selected === date}>
                                    {date}
                                </NavDropdown.Item>
                            )
                        })
                    }
                </NavDropdown>
            </>
        );
    }

    private getTitle() {
        const { selected } = this.state;
        return this.context.latest === selected ? "Snapshot" : selected;
    }
}

SnapshotSelector.contextType = SnapshotContext;
export default SnapshotSelector;