import {GoogleApiWrapper, IProvidedProps, Map} from 'google-maps-react';
import React from "react";

interface GoogleMapProps extends IProvidedProps {
    center?: { lat: number, lng: number };
}

export class GoogleMap extends React.Component<GoogleMapProps> {
    render() {
        return (
            <Map
                containerStyle={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%'
                }}
                style={{
                    width: '100%',
                    height: '100%'
                }}
                google={this.props.google}
            >
                {this.props.children}
            </Map>
        );
    }
}

export default GoogleApiWrapper({
    apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
})(GoogleMap)