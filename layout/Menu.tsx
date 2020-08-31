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
                        <Nav.Link href="/">
                            <FontAwesomeIcon icon={faHome} size="xs" fixedWidth /> Overview
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link href="/workouts">
                            <FontAwesomeIcon icon={faRunning} size="xs" fixedWidth /> Workouts
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link href="/sleep">
                            <FontAwesomeIcon icon={faMoon} size="xs" fixedWidth /> Sleep
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
            </>

        )
    }
}

export default Menu;