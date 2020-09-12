import { Component } from "react";
import { Nav, Container } from "react-bootstrap";
import { faRunning, faMoon, faHome, faDumbbell } from '@fortawesome/free-solid-svg-icons';
import Item from "./Item";
import styles from '../../assets/sass/components/layout/menu.module.scss';

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
                    <Item name="Overview" icon={faHome} page="/" className="overview" />
                    <Item name="Running" icon={faRunning} page="/workouts" className="running" />
                    <Item name="Gym" icon={faDumbbell} page="/strength" className="gym" />
                    <Item name="Sleep" icon={faMoon} page="/sleep" className="sleep" />
                </Nav>
            </Container>

        )
    }
}

export default Menu;