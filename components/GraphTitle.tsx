import { Row } from 'react-bootstrap';
import styles from '../public/graphtitle.module.css';

export interface GraphTitleProps {
    title: string;
}

const GraphTitle: React.FunctionComponent<GraphTitleProps> = ({ title }) => {
    return (
        <Row className={styles.title}>
            <p>{title}</p>
        </Row>
    )
}

export default GraphTitle;