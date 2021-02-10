import {GoogleApiWrapper, IProvidedProps, Map} from 'google-maps-react';
import styles from '../../assets/sass/components/GoogleMap.module.scss'
import React from "react";

interface GoogleMapProps extends IProvidedProps {
    center?: { lat: number, lng: number };
}

export class GoogleMap extends React.Component<GoogleMapProps> {
    render() {
        return (
            <Map google={this.props.google}>{this.props.children}</Map>
        );
    }
}

export default GoogleApiWrapper({
    apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
})(GoogleMap)