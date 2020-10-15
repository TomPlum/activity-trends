import { Navbar, Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { Component } from 'react';
import SnapshotSelector from './SnapshotSelector';
import styles from '../../assets/sass/components/layout/Header.module.scss'
import { SnapshotDates } from '../domain/SnapshotDates';

interface HeaderProps {
    snapshotDates: SnapshotDates
}

class Header extends Component<HeaderProps> {
    render() {
        return (
            <Navbar bg="dark" variant="dark" fixed="top" className={styles.header}>
                <Navbar.Brand>
                    <img
                        alt="activity-rings-logo"
                        src="/logo.png"
                        width="30px"
                        height="30px"
                        className={styles.logo}
                    />{' '}
                    Activity Trends
                </Navbar.Brand>
                <Navbar.Toggle />

                <Navbar.Collapse className="justify-content-end">
                    <SnapshotSelector snapshotDates={this.props.snapshotDates} />
                    <Nav>
                        <Nav.Link target="_blank" href="https://www.github.com/TomPlum" className={styles.link}>
                            <FontAwesomeIcon icon={faGithub} size="lg" fixedWidth className={styles.github} />
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        );
    }
}

export default Header;