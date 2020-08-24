import styles from '../public/header.module.css'

const Header: React.FunctionComponent = () => {
    return (
        <header className={styles.header}>
            <p>Activity Trends</p>
        </header>
    )
}

export default Header;