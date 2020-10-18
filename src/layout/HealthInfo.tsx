import { Component } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { GitInformation } from '../domain/GitInformation';
import { faHammer, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
                overlay={this.renderTooltip}
                trigger={["hover", "focus"]}
            >
                <FontAwesomeIcon
                    fixedWidth
                    className={styles.icon}
                    icon={faInfoCircle}
                />
            </OverlayTrigger>
        );
    }

    renderTooltip = (props) => {
        const data = this.props.info;
        return (
            <Popover id="health" className={styles.tooltip} {...props}>
                <Popover.Title className={styles.heading}>
                    <FontAwesomeIcon fixedWidth icon={faHammer} className={styles.hammer}/>{' '}Latest Build
                </Popover.Title>
                <Popover.Content>
                    <p className={styles.label}>Branch:
                        <a href={data.getBranchURI()} target="_blank">
                            <span className={styles.value}>{data.getBranch()}</span>
                        </a>
                    </p>
                    <p className={styles.label}>Hash:
                        <a href={data.getCommitURI()} target="_blank">
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
}

export default HealthInfo;