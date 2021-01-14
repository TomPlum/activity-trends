import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/sass/global/styles.scss';
import './assets/sass/global/activity-rings.scss';
import './assets/sass/global/recharts.scss';
import './assets/sass/global/react-bootstrap.scss';
import 'nprogress/nprogress.css';
import '@fortawesome/fontawesome-svg-core/styles.css'
import { config } from "@fortawesome/fontawesome-svg-core";
import MainLayout from './presentation/layout/Main';
import ErrorBoundary from './presentation/pages/ErrorBoundary';
import React from 'react';
import { HashRouter } from 'react-router-dom'

config.autoAddCss = false;

const ActivityTrendsApplication = () => {
    return (
        <ErrorBoundary>
            <HashRouter basename={process.env.REACT_APP_BASE_PATH}>
                <MainLayout/>
            </HashRouter>
        </ErrorBoundary>
    );
}

export default ActivityTrendsApplication;