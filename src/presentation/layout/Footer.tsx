import { Container, Navbar } from 'react-bootstrap'
import styles from '../../assets/sass/components/layout/Footer.module.scss'
import React, { Component } from 'react';
import moment from "moment";


class Footer extends Component {
    render() {
        return (
            <Container fluid>
                <Navbar bg="light" variant="light" fixed="bottom" className={styles.footer}>
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