import { Container } from "react-bootstrap";
import React from "react";
import styles from '../../assets/sass/pages/NotFound.module.scss';

const NotFound = () => {
  return (
    <Container fluid className={styles.container}>
      <h1 className={styles.number}>
        404
      </h1>
      <h3 className={styles.text}>Page not found.</h3>
    </Container>
  );
}


export default NotFound;