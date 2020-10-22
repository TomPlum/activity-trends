import React, { Component } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { faHammer, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AppInformation } from '../domain/AppInformation';
import styles from '../assets/sass/components/layout/HealthInfo.module.scss';
import { InfoService } from "../service/InfoService";

interface HealthInfoState {
    isActive: boolean;
    data: AppInformation;
}

class HealthInfo extends Component<{ }, HealthInfoState> {
    constructor(props) {
        super(props);
        this.state = {
            isActive: false,
            data: AppInformation.empty()
        }
    }

    async componentDidMount() {
        const data = await new InfoService().getInfo();
        this.setState({ data });
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
        const info = this.state.data;
        const git = info.getGitInfo();
        const build = info.getBuildInfo();

        return (
            <Popover id="health" className={styles.tooltip} {...props}>
                <Popover.Title className={styles.heading}>
                    <FontAwesomeIcon fixedWidth icon={faHammer} className={styles.hammer}/>{' '}Latest Build
                </Popover.Title>

                <Popover.Content>
                    <p className={styles.label}>Branch:
                        <a href={git.getBranchURI()} target="_blank" rel="noopener noreferrer">
                            <span className={styles.value}>{git.getBranch()}</span>
                        </a>
                    </p>
                    <p className={styles.label}>Hash:
                        <a href={git.getCommitURI()} target="_blank" rel="noopener noreferrer">
                            <span className={styles.value}>{git.getHash()}</span>
                        </a>
                    </p>
                    <p className={styles.label}>Date:
                        <span className={styles.value}>{git.getDate()}</span>
                    </p>
                    <p className={styles.label}>Ver:
                        <span className={styles.value}>{build.getVersion()}</span>
                    </p>
                </Popover.Content>
            </Popover>
        );
    }
}

export default HealthInfo;