import styles from '../assets/css/components/header.module.css'
import { Navbar } from 'react-bootstrap'

const Header: React.FunctionComponent = () => {
    return (
        <Navbar bg="dark" variant="dark" fixed="top" className={styles.header}>
            <Navbar.Brand>
                <img
                    alt="activity-rings-logo"
                    src="/logo.png"
                    width="28px"
                    height="28px"
                    className={styles.logo}
                />{' '}
                Activity Trends
            </Navbar.Brand>
        </Navbar>
    )
}

export default Header;