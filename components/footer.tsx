import { Component } from "react";
import { Container, Row, Col } from 'react-bootstrap'
import styles from '../public/footer.module.css'

interface FooterProps {
    lastDataUpdate: String
}

const Footer: React.FunctionComponent<FooterProps> = ({lastDataUpdate}) => {
    return (
        <footer className={styles.footer}>
            <Container fluid>
                <Row>
                    <Col>
                        <p>Created by Thomas Plumpton.</p>
                    </Col>
                    <Col>
                        <p>Data as of: {lastDataUpdate}</p>
                    </Col>
                </Row>
            </Container>
        </footer>
    )
}

export default Footer;