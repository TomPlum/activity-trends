import React, { Component } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import Countup from 'react-countup';
import styles from '../../assets/sass/components/sleep/InfoCard.module.scss';

export interface InfoCardProps {
  value: number,
  unit?: string;
  title: string,
  icon: IconDefinition,
  colour: string,
  opacity?: number
}

class InfoCard extends Component<InfoCardProps> {
  render() {
    const {value, title, icon, unit, colour, opacity} = this.props;
    return (
      <Card className={styles.card}>
        <Row className={styles.row}>
          <Col sm={4} xs={6}>
            <span className="fa-layers fa-5x">
              <FontAwesomeIcon icon={faCircle} className={styles.circle} color={colour} opacity={opacity ? opacity : 0.6}/>
              <FontAwesomeIcon icon={icon} className={styles.icon}/>
            </span>
          </Col>
          <Col sm={8} xs={6}>
            {value
              ? <Countup start={0} end={Number(value)} suffix={unit} duration={2} className={styles.value}/>
              : <span className={styles.value}>N/A</span>
            }
            <h6 className={styles.title}>{title}</h6>
          </Col>
        </Row>
      </Card>
    );
  }
}

export default InfoCard;