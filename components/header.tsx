import styles from '../public/header.module.css'
import { Container, Row, Col } from 'react-bootstrap'

const Header: React.FunctionComponent = () => {
    return (
        <Container className={styles.header} fluid>
            <Row>
                <Col lg={4}>
                    <h3>Activity Trends</h3>
                </Col>
            </Row>
        </Container>
    )
}

export default Header;