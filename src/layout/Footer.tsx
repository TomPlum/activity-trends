import { Container, Navbar } from 'react-bootstrap'
import styles from '../../assets/css/components/footer.module.css'

interface FooterProps {
    lastDataUpdate: String
}

const Footer: React.FunctionComponent<FooterProps> = ({ lastDataUpdate }) => {
    return (
        <Container fluid>
            <Navbar bg="light" variant="light" fixed="bottom" className={styles.footer}>
                <Navbar.Brand>
                    Created by Thomas Plumpton &nbsp; | &nbsp; Last data import {lastDataUpdate}
                </Navbar.Brand>
            </Navbar>
        </Container>
    )
}

export default Footer;