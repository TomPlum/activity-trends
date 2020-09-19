import { NavDropdown } from 'react-bootstrap';
import styles from '../../assets/sass/components/layout/SnapshotSelector.module.scss'
import { Component } from 'react';

interface SnapshotSelectorProps {
    mostRecent: string;
    snapshots: string[];
}

interface SnapshotSelectorState {
    selected: string;
}

class SnapshotSelector extends Component<SnapshotSelectorProps, SnapshotSelectorState> {
    constructor(props) {
        super(props);
        this.state = {
            selected: this.props.mostRecent
        }
    }
    render() {
        const { selected } = this.state;
        return (
            <NavDropdown title="Snapshot" id="snapshot-dropdown" className={styles.snapshot}>
                {
                    this.props.snapshots.map(date => {
                        return (
                            <NavDropdown.Item className={styles.date} eventKey={date}>
                                {date}
                            </NavDropdown.Item>
                        )
                    })
                }
                <NavDropdown.Divider />
                <NavDropdown.Item className={styles.selected} eventKey={selected}>
                    Current: {selected}
                </NavDropdown.Item>
            </NavDropdown>
        );
    }
}

export default SnapshotSelector;