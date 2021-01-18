import {Navbar} from 'react-bootstrap';
import React, {Component} from 'react';
import SnapshotSelector from './SnapshotSelector';
import HealthInfo from "./HealthInfo";
import styles from '../../assets/sass/components/layout/Header.module.scss'

class Header extends Component {
    render() {
        return (
            <Navbar fixed="top" className={styles.header}>
                <Navbar.Brand>
                    <img
                        alt="activity-rings-logo"
                        src={process.env.REACT_APP_BASE_PATH + "logo.png"}
                        width="30px"
                        height="30px"
                        className={styles.logo}
                    />{' '}
                    <span className={styles.name}>Activity Trends</span>
                </Navbar.Brand>
                <Navbar.Toggle />

                <Navbar.Collapse className="justify-content-end">
                    <SnapshotSelector />
                    <HealthInfo />
                </Navbar.Collapse>
            </Navbar>
        );
    }
}

export default Header;