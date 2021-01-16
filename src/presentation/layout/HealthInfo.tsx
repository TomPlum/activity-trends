import React, { Component } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { faBurn, faExclamationCircle, faHammer, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AppInformation } from '../../domain/AppInformation';
import { InfoService } from "../../application/service/InfoService";
import styles from '../../assets/sass/components/layout/HealthInfo.module.scss';

interface HealthInfoState {
    isActive: boolean;
    data: AppInformation;
    error: Error;
}

class HealthInfo extends Component<{}, HealthInfoState> {
    constructor(props) {
        super(props);
        this.state = {
            isActive: false,
            data: AppInformation.empty(),
            error: undefined
        }
    }

    async componentDidMount() {
        await new InfoService().getInfo()
            .then(data => this.setState({ data }))
            .catch(error => this.setState({ error }));
    }

    render() {
        const { error } = this.state;

        return (
            <OverlayTrigger
                placement="bottom"
                delay={{ show: 100, hide: 2000 }}
                overlay={error ? this.renderErrorTooltip : this.renderTooltip}
                trigger={["hover", "focus"]}
            >
                <FontAwesomeIcon fixedWidth className={error ? styles.tooltipIcon : styles.icon} icon={error ? faExclamationCircle : faInfoCircle} />
            </OverlayTrigger>
        );
    }

    renderTooltip = (props) => {
        const { data } = this.state;
        const git = data.getGitInfo();
        const build = data.getBuildInfo();

        return (
            <Popover id="health" className={styles.tooltip} {...props}>
                <Popover.Title className={styles.heading}>
                    <FontAwesomeIcon fixedWidth icon={faHammer} className={styles.tooltipIcon}/>{' '}Latest Build
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

    renderErrorTooltip = (props) => {
        return (
            <Popover id="health" className={styles.tooltip} {...props}>
                <Popover.Title className={styles.heading}>
                    <FontAwesomeIcon fixedWidth icon={faBurn} />{' '}Connectivity
                </Popover.Title>

                <Popover.Content>
                    <p className={styles.label}>Reason:
                        <span className={styles.value}>{this.state.error.toString()}</span>
                    </p>
                </Popover.Content>
            </Popover>
        );
    }
}

export default HealthInfo;