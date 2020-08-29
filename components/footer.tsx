import { Container, Row, Col } from 'react-bootstrap'
import styles from '../public/footer.module.css'

interface FooterProps {
    lastDataUpdate: String
}

const Footer: React.FunctionComponent<FooterProps> = ({ lastDataUpdate }) => {
    return (
        <Container className={styles.footer} fluid>
            <Row>
                <Col>
                    <p>Created by Thomas Plumpton.</p>
                </Col>
                <Col>
                    <p>Data as of: {lastDataUpdate}</p>
                </Col>
            </Row>
        </Container>
    )
}

export default Footer;