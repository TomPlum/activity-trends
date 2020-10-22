import { Container, Navbar } from 'react-bootstrap'
import styles from '../assets/sass/components/layout/Footer.module.scss'
import React, { Component } from 'react';


class Footer extends Component {
    render() {
        return (
            <Container fluid>
                <Navbar bg="light" variant="light" fixed="bottom" className={styles.footer}>
                    <Navbar.Brand>
                        Created by Thomas Plumpton
                    </Navbar.Brand>
                </Navbar>
            </Container>
        );
    }
}

export default Footer;