import { Component } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { GitInformation } from '../domain/GitInformation';
import { faHammer, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip } from 'react-bootstrap';
import styles from '../../assets/sass/components/layout/HealthInfo.module.scss';

interface HealthInfoProps {
    info: GitInformation;
}

interface HealthInfoState {
    isActive: boolean;
}

class HealthInfo extends Component<HealthInfoProps, HealthInfoState> {
    constructor(props) {
        super(props);
        this.state = {
            isActive: false
        }
    }

    render() {
        return (
            <OverlayTrigger
                placement="bottom"
                delay={{ show: 100, hide: 2000 }}
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
        const data = this.props.info;
        return (
            <Popover className={styles.tooltip} {...props}>
                <Popover.Title className={styles.heading}>
                    <FontAwesomeIcon fixedWidth icon={faHammer} />{' '}Latest Build
                </Popover.Title>
                <Popover.Content>
                    <p className={styles.label}>Branch:
                        <span className={styles.value}>{data.getBranch()}</span>
                    </p>
                    <p className={styles.label}>Hash:
                        <a href={this.getCommitURI()} target="_blank">
                            <span className={styles.value}>{data.getHash()}</span>
                        </a>
                    </p>
                    <p className={styles.label}>Date:
                        <span className={styles.value}>{data.getDate()}</span>
                    </p>
                </Popover.Content>
            </Popover>
        );
    }

    private getCommitURI() {
        return "https://github.com/TomPlum/activity-trends-api/commit/" + this.props.info.getHash();
    }
}

export default HealthInfo;