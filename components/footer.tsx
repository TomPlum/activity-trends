import { Component } from "react";
import styles from '../public/footer.module.css'

const Footer: React.FunctionComponent = () => {
    return (
        <footer className={styles.footer}>
            <p>Created by Thomas Plumpton.</p>
        </footer>
    )
}

export default Footer;