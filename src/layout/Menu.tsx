import React, { Component } from "react";
import { Nav } from "react-bootstrap";
import { faRunning, faMoon, faHome, faDumbbell } from '@fortawesome/free-solid-svg-icons';
import Item from "./Item";
import styles from '../assets/sass/components/layout/Menu.module.scss';

class Menu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            active: undefined
        }
    }

    render() {
        return (
            <Nav activeKey="/" className={styles.nav + " flex-column"}>
                <Item name="Overview" icon={faHome} page="/" className="overview" />
                <Item name="Running" icon={faRunning} page="/running" className="running" />
                <Item name="Gym" icon={faDumbbell} page="/gym" className="gym" />
                <Item name="Sleep" icon={faMoon} page="/sleep" className="sleep" />
            </Nav>
        )
    }
}

export default Menu;