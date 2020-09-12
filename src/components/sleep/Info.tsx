import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Component } from 'react';
import styles from '../../../assets/sass/components/sleep/Info.module.scss';

interface InfoProps {
    text?: string;
}

interface InfoState {
    isActive: boolean;
}

class Info extends Component<InfoProps, InfoState> {
    constructor(props) {
        super(props);
        this.state = {
            isActive: false
        }
    }

    render() {
        return (
            <OverlayTrigger
                placement="right"
                delay={{ show: 100, hide: 250 }}
                overlay={this.renderTooltip}>
                <FontAwesomeIcon
                    fixedWidth
                    className={styles.icon}
                    icon={faInfoCircle}
                    onMouseEnter={() => this.setState({ isActive: true })}
                    onMouseLeave={() => this.setState({ isActive: false })}
                />
            </OverlayTrigger>
        );
    }

    renderTooltip = (props) => {
        return (
            <Tooltip className={styles.text} {...props}>
                {this.props.text}
            </Tooltip>
        );
    }

};

export default Info;