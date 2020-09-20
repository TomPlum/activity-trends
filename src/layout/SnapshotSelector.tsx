import { NavDropdown } from 'react-bootstrap';
import { Component } from 'react';
import styles from '../../assets/sass/components/layout/SnapshotSelector.module.scss'

interface SnapshotSelectorProps {
    mostRecent: string;
    snapshots: string[];
    onChange: (snapshot: string) => void;
}

interface SnapshotSelectorState {
    selected: string;
    isDisabled: boolean;
}

class SnapshotSelector extends Component<SnapshotSelectorProps, SnapshotSelectorState> {
    constructor(props) {
        super(props);
        this.state = this.select.bind(this);
        this.state = {
            selected: this.props.mostRecent,
            isDisabled: false
        }
    }

    select = (snapshot) => {
        this.setState({ selected: snapshot, isDisabled: true });
        this.props.onChange(snapshot);
        this.setState({ isDisabled: false });
    }

    render() {
        const { mostRecent } = this.props;
        const { isDisabled, selected } = this.state;

        return (
            <NavDropdown title={this.getTitle()} id="snapshot-dropdown" className={styles.snapshot} onSelect={this.select} disabled={isDisabled}>
                <NavDropdown.Item className={styles.selected} key={mostRecent} eventKey={mostRecent}>
                   Most Recent
                </NavDropdown.Item>
                <NavDropdown.Divider />
                {
                    this.props.snapshots.map(date => {
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
        return this.props.mostRecent === selected ? "Snapshot" : selected;
    }
}   

export default SnapshotSelector;