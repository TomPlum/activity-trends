import React, { Component } from "react";
import { Dropdown } from "react-bootstrap";
import { GraphType } from "../../types/GraphType";
import styles from "../../assets/sass/components/sleep/GraphTypeButton.module.scss";

interface GraphTypeButtonProps {
    onChange: (option) => void;
    options: GraphType[];
    default?: GraphType;
}

interface GraphTypeButtonState {
    selectedType: GraphType;
}

class GraphTypeButton extends Component<GraphTypeButtonProps, GraphTypeButtonState> {
    constructor(props) {
        super(props);
        this.state = {
            selectedType: props.default ? props.default : props.options ? props.options[0] : GraphType.UNKNOWN
        }
    }

    onSelect = (option) => {
        this.setState({ selectedType: option })
        this.props.onChange(option);
    }

    render() {
        const { selectedType } = this.state;
        return (
            <Dropdown className={styles.dropdown} onSelect={this.onSelect}>
                <Dropdown.Toggle 
                    className={styles.toggle}
                    variant="link">{this.state.selectedType}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                    {
                        this.props.options.filter(option => option != selectedType).map(option => {
                            return <Dropdown.Item
                                className={styles.option}
                                key={option}
                                eventKey={option}>
                                {option}
                            </Dropdown.Item>
                        })
                    }
                </Dropdown.Menu>
            </Dropdown>
        )
    }
}

export default GraphTypeButton;