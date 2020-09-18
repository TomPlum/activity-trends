import { NavDropdown } from 'react-bootstrap';
import styles from '../../assets/sass/components/layout/SnapshotSelector.module.scss'

const SnapshotSelector = ({ dates }) => {
    return (
        <NavDropdown title="Data Snapshot" id="snapshot-dropdown" className={styles.snapshot}>
            {
                dates.map(date => <NavDropdown.Item className={styles.date} eventKey={date}>{date}</NavDropdown.Item>)
            }
            <NavDropdown.Divider />
            <NavDropdown.Item className={styles.selected} eventKey="4.4">Default Date</NavDropdown.Item>
        </NavDropdown>
    );
}

export default SnapshotSelector;