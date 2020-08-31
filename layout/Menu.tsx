import { Component } from "react";
import { Container, Nav } from "react-bootstrap";
import styles from '../assets/css/components/menu.module.css';

interface MenuState {
    active: string;
}

class Menu extends Component<MenuState> {
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
                        <Nav.Link href="/">Overview</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link href="/workouts">Workouts</Nav.Link>
                    </Nav.Item>
                </Nav>
            </>

        )
    }
}

export default Menu;