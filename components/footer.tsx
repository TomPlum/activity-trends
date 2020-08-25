import { Component } from "react";
import styles from '../public/footer.module.css'

interface FooterProps {
    lastDataUpdate: String
}

const Footer: React.FunctionComponent<FooterProps> = ({lastDataUpdate}) => {
    return (
        <footer className={styles.footer}>
            <p>Created by Thomas Plumpton.</p>
            <p>Data as of: {lastDataUpdate}</p>
        </footer>
    )
}

export default Footer;