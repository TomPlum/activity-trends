import Header from './Header';
import Footer from './Footer';
import Menu from './Menu';
import { Row, Col, Container } from 'react-bootstrap';
import { Component } from 'react';
import styles from '../../assets/sass/components/layout/Main.module.scss'

interface MainLayoutState {
    snapshot: string;
}

class MainLayout extends Component<{}, MainLayoutState> {
    constructor(props) {
        super(props);
        this.state = {
            snapshot: undefined,
        }
    }

    handleDataChange = (date: string) => this.setState({ snapshot: date });

    render() {
        return (
            <Container fluid className={styles.wrapper}>
                <Row className={styles.row}>
                    <Header onDataChange={this.handleDataChange} />
                </Row>
                <Row className={styles.row}>
                    <div className={styles.sidebar}>
                        <Menu />
                    </div>
                    <Col className={styles.content}>
                        {this.props.children}
                    </Col>
                </Row>

                <Footer lastDataUpdate={this.state.snapshot} />
            </Container>
        );
    }
}

export default MainLayout;