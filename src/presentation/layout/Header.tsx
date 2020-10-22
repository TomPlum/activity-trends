import { Navbar, Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import React, { Component } from 'react';
import SnapshotSelector from './SnapshotSelector';
import HealthInfo from "./HealthInfo";
import styles from '../../assets/sass/components/layout/Header.module.scss'

class Header extends Component {
    render() {
        return (
            <Navbar bg="dark" variant="dark" fixed="top" className={styles.header}>
                <Navbar.Brand>
                    <img
                        alt="activity-rings-logo"
                        src={process.env.REACT_APP_BASE_PATH + "logo.png"}
                        width="30px"
                        height="30px"
                        className={styles.logo}
                    />{' '}
                    Activity Trends
                </Navbar.Brand>
                <Navbar.Toggle />

                <Navbar.Collapse className="justify-content-end">
                    <HealthInfo />
                    <SnapshotSelector />
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