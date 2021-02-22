import styles from "../../assets/sass/components/layout/LoadingSpinner.module.scss";
import React from "react";
import {Spinner} from "react-bootstrap";

const LoadingSpinner = ({active}) => {
    if (active) {
        return (
            <div className={styles.wrapper}>
                <Spinner className={styles.spinner} animation="border" role="status"/>
            </div>
        );
    }
    return null;
}

export default LoadingSpinner