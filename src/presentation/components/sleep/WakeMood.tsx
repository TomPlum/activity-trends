import React, {Component} from "react";
import {Mood} from '../../../domain/Mood';
import {Container} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faFrown, faGrinBeam, faMeh, faSmile, faTired,} from '@fortawesome/free-solid-svg-icons';
import styles from '../../../assets/sass/components/sleep/WakeMood.module.scss';

interface WakeMoodProps {
    mood: Mood;
}

class WakeMood extends Component<WakeMoodProps> {
    render() {
        return (
            <Container>
                <FontAwesomeIcon icon={faGrinBeam} title={"Great"} className={this.getClass(Mood.GREAT)} />
                <FontAwesomeIcon icon={faSmile} title={"Good"} className={this.getClass(Mood.GOOD)} />
                <FontAwesomeIcon icon={faMeh} title="Ok" className={this.getClass(Mood.OK)} />
                <FontAwesomeIcon icon={faFrown} title={"Not So Good"} className={this.getClass(Mood.NOT_SO_GOOD)} />
                <FontAwesomeIcon icon={faTired} title={"Bad"} className={this.getClass(Mood.BAD)} />
            </Container>
        );
    }

    private getClass = (targetMood: Mood) => this.props.mood === targetMood ? styles.active : styles.inactive
    
}

export default WakeMood;