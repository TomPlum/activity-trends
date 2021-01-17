import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/sass/global/styles.scss';
import './assets/sass/global/activity-rings.scss';
import './assets/sass/global/recharts.scss';
import './assets/sass/global/react-bootstrap.scss';
import 'nprogress/nprogress.css';
import '@fortawesome/fontawesome-svg-core/styles.css'
import { config } from "@fortawesome/fontawesome-svg-core";
import MainLayout from './presentation/layout/Main';
import React from 'react';
import { HashRouter } from 'react-router-dom'
import ErrorBoundary from './presentation/pages/ErrorBoundary';

config.autoAddCss = false;

const ActivityTrendsApplication = (props) => {
    return (
        <HashRouter basename={process.env.REACT_APP_BASE_PATH}>
            <ErrorBoundary key={props.location?.pathName}>
                <MainLayout/>
            </ErrorBoundary>
        </HashRouter>
    );
}

export default ActivityTrendsApplication;