import { Component } from "react";
import { Nav, Container } from "react-bootstrap";
import styles from '../../assets/css/components/menu.module.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRunning, faMoon, faHome, faDumbbell } from '@fortawesome/free-solid-svg-icons';

interface MenuState {
    active: string;
}

class Menu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            active: undefined
        }
    }

    render() {
        return (
            <Container>
                <Nav activeKey="/" className={styles.menu + " flex-column"}>
                    <Nav.Item>
                        <Nav.Link href="/" className={styles.link}>
                            <FontAwesomeIcon icon={faHome} size="sm" className={styles.icon} fixedWidth /> Overview
                        </Nav.Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Nav.Link href="/strength" className={styles.link}>
                            <FontAwesomeIcon icon={faDumbbell} size="sm" className={styles.icon} fixedWidth /> Gym
                        </Nav.Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Nav.Link href="/workouts" className={styles.link}>
                            <FontAwesomeIcon icon={faRunning} size="sm" className={styles.icon} fixedWidth /> Running
                        </Nav.Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Nav.Link href="/sleep" className={styles.link}>
                            <FontAwesomeIcon icon={faMoon} size="sm" className={styles.icon} fixedWidth /> Sleep
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
            </Container>

        )
    }
}

export default Menu;