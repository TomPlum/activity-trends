import React, {Component} from "react";
import {Card} from "react-bootstrap";
import {CardioRoute} from "../../../domain/health/workout/CardioRoute";
import GoogleMap from "../GoogleMap";
import {Polyline} from "google-maps-react";
import {HealthService} from "../../../application/service/HealthService";
import LoadingSpinner from "../../layout/LoadingSpinner";
import styles from '../../../assets/sass/components/health/CardioRouteMap.module.scss';

interface CardioRouteMapProps {
    routeName: string;
}

interface CardioRouteMapState {
    loading: boolean;
    data: CardioRoute;
    error: Error;
    isHoveringOverRoute: boolean;
}

class CardioRouteMap extends Component<CardioRouteMapProps, CardioRouteMapState> {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: undefined,
            isHoveringOverRoute: false,
            error: undefined
        }
    }

    async componentDidMount() {
        if (this.props.routeName) {
            await new HealthService()
                .getCardioRoute(this.props.routeName)
                .then(data => this.setState({loading: false, data}))
                .catch(error => this.setState({error}));
        }
    }

    render() {
        const { loading, data, isHoveringOverRoute, error } = this.state;
        return (
            <Card className={styles.card}>
                <Card.Body>
                    <Card.Title>Route</Card.Title>
                    <LoadingSpinner active={loading}/>
                    {data ?
                        <GoogleMap>
                            <Polyline
                                path={this.getRoutePathCoordinates()}
                                strokeColor={"#94d55a"}
                                strokeOpacity={isHoveringOverRoute ? 1 : 0.8}
                                className={isHoveringOverRoute ? styles.routeActive : styles.routeInactive}
                                strokeWeight={isHoveringOverRoute ? 4 : 2}
                                onMouseover={() => this.setState({isHoveringOverRoute: true})}
                                onMouseout={() => this.setState({isHoveringOverRoute: false})}
                            />
                        </GoogleMap> :
                        error ? "Failed to load route "  + this.props.routeName : <GoogleMap />
                    }
                </Card.Body>
            </Card>
        );
    }

    private getRoutePathCoordinates = () => this.state.data.points.map(point => {
        return { lat: point.latitude, lng: point.longitude };
    });
}


export default CardioRouteMap;