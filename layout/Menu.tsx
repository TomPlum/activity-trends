import { Component } from "react";
import { Container, Nav } from "react-bootstrap";
import styles from '../assets/css/components/menu.module.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRunning, faMoon, faHome } from '@fortawesome/free-solid-svg-icons';

interface MenuState {
    active: string;
}

class Menu extends Component<{}> {
    constructor(props) {
        super(props);
        this.state = {
            active: undefined
        }
    }

    render() {
        return (
            <>
                <h4>Menu</h4>
                <Nav activeKey="/" className={styles.menu + " flex-column"}>
                    <Nav.Item>
                        <Nav.Link href="/" className={styles.link}>
                            <FontAwesomeIcon icon={faHome} size="sm" className={styles.icon} fixedWidth /> Overview
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link href="/workouts" className={styles.link}>
                            <FontAwesomeIcon icon={faRunning} size="sm" className={styles.icon} fixedWidth /> Workouts
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link href="/sleep" className={styles.link}>
                            <FontAwesomeIcon icon={faMoon} size="sm" className={styles.icon} fixedWidth /> Sleep
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
            </>

        )
    }
}

export default Menu;