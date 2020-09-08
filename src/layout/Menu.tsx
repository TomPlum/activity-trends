import { Component } from "react";
import { Nav, Container } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRunning, faMoon, faHome, faDumbbell } from '@fortawesome/free-solid-svg-icons';
import styles from '../../assets/sass/components/layout/menu.module.scss';

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
                            <FontAwesomeIcon
                                icon={faHome}
                                className={styles.overview}
                                fixedWidth
                            /> Overview
                        </Nav.Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Nav.Link href="/workouts" className={styles.link}>
                            <FontAwesomeIcon
                                icon={faRunning}
                                className={styles.running}
                                fixedWidth
                            /> Running
                        </Nav.Link>
                    </Nav.Item>


                    <Nav.Item>
                        <Nav.Link href="/strength" className={styles.link}>
                            <FontAwesomeIcon
                                icon={faDumbbell}
                                className={styles.gym}
                                fixedWidth
                            /> Gym
                        </Nav.Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Nav.Link href="/sleep" className={styles.link}>
                            <FontAwesomeIcon
                                icon={faMoon}
                                className={styles.sleep}
                                fixedWidth
                            /> Sleep
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
            </Container>

        )
    }
}

export default Menu;