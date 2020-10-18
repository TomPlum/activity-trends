import { Navbar, Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { Component } from 'react';
import SnapshotSelector from './SnapshotSelector';
import styles from '../../assets/sass/components/layout/Header.module.scss'
import { SnapshotDates } from '../domain/SnapshotDates';
import HealthInfo from './HealthInfo';
import { GitInformation } from '../domain/GitInformation';
import { BuildInfo } from '../domain/BuildInfo';
import { AppInformation } from '../domain/AppInformation';

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
                    <HealthInfo info={new AppInformation(new GitInformation("dev", "a834kda", "17/10/2020"), new BuildInfo("0.0.1-SNAPSHOT"))}/>
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