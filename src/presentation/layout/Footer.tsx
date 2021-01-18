import {Container, Nav, Navbar} from 'react-bootstrap'
import styles from '../../assets/sass/components/layout/Footer.module.scss'
import React, { Component } from 'react';
import moment from "moment";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faGithub} from "@fortawesome/free-brands-svg-icons";


class Footer extends Component {
    render() {
        return (
            <Container fluid>
                <Navbar fixed="bottom" className={styles.footer}>
                    <Nav>
                        <Nav.Link target="_blank" href="https://www.github.com/TomPlum" className={styles.link}>
                            <FontAwesomeIcon icon={faGithub} size="lg" fixedWidth className={styles.github} />
                        </Nav.Link>
                    </Nav>
                    <Navbar.Brand>
                        <span>Thomas Plumpton &copy; {Footer.getCurrentYear()}</span>
                    </Navbar.Brand>
                </Navbar>
            </Container>
        );
    }

    private static getCurrentYear(): string {
        return moment().year().toString();
    }
}

export default Footer;