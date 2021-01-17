import { faExclamationCircle, faPlug, faDizzy, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from "../../assets/sass/components/layout/DisabledOverlay.module.scss";
import {Numbers} from "../../utility/Numbers";

const DisabledOverlay = ({active}) => {
    if (active) {
        return(
            <div className={styles.container}>
                <div className={styles.wrapper}>
                    <h3 className={styles.heading}>
                        <FontAwesomeIcon icon={getRandomIcon()} className={styles.headingIcon}/> {getRandomHeading()}
                    </h3>
                    <div className={styles.break}/>
                    <h4 className={styles.subtitle}>No data was received</h4>
                    <span className={styles.description}>
                        See the status{' '}
                        <FontAwesomeIcon icon={faExclamationCircle} className={styles.referenceIcon}/>
                        {' '}at the top right for more information
                    </span>
                </div>
            </div>
        );
    }
    return null;
}

function getRandomIcon() {
    const icons = [faPlug, faDizzy, faTimes];
    const i = Numbers.randomInt(0, icons.length - 1);
    return icons[i];
}

function getRandomHeading() {
    const messages = ["Oops!", "Oh No!", "Chotto Matte!", "Nani?!"];
    const i = Numbers.randomInt(0, messages.length - 1);
    return messages[i];
}

export default DisabledOverlay;