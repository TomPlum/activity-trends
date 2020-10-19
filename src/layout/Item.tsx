import React, { Component } from "react";
import { Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import styles from '../assets/sass/components/layout/Item.module.scss';

interface ItemProps {
    name: string;
    icon: IconDefinition;
    page: string;
    className?: string;
}

class Item extends Component<ItemProps> {
    render() {
        const { name, icon, page, className } = this.props;
        return (
            <Nav.Item>
                <Nav.Link className={styles.link} eventKey={name}>
                    <FontAwesomeIcon
                        icon={icon}
                        className={styles[className]}
                        fixedWidth
                    />
                    <p className={styles.name}>{name}</p>
                </Nav.Link>
            </Nav.Item>
        );
    }
}

export default Item;