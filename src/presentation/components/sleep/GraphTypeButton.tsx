import React, { Component } from "react";
import { Dropdown } from "react-bootstrap";
import { GraphType } from "../../../infrastructure/types/GraphType";
import styles from "../../../assets/sass/components/sleep/GraphTypeButton.module.scss";

interface GraphTypeButtonProps {
  onChange: (option) => void;
  options: GraphType[];
  defaultType?: GraphType;
  disabled: boolean;
}

interface GraphTypeButtonState {
  selectedType: GraphType;
}

class GraphTypeButton extends Component<GraphTypeButtonProps, GraphTypeButtonState> {
  constructor(props) {
    super(props);
    const {defaultType, options} = props;
    this.state = {
      selectedType: defaultType ? defaultType : options ? options[0] : GraphType.UNKNOWN
    }
  }

  onSelect = (option) => {
    this.setState({selectedType: option})
    this.props.onChange(option);
  }

  shouldComponentUpdate(nextProps: Readonly<GraphTypeButtonProps>): boolean {
    return nextProps.defaultType !== this.state.selectedType;
  }

  componentDidUpdate(prevProps: Readonly<GraphTypeButtonProps>) {
    const {defaultType} = this.props;
    if (prevProps.defaultType !== defaultType) {
      this.setState({selectedType: defaultType});
    }
  }

  render() {
    const {selectedType} = this.state;
    return (
      <Dropdown className={styles.dropdown} onSelect={this.onSelect}>
        <Dropdown.Toggle className={styles.toggle} variant="link" disabled={this.props.disabled}>
          {selectedType}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {
            this.props.options.filter(option => option !== selectedType).map(option => {
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