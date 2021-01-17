import React from "react";
import { Route } from 'react-router-dom';
import nprogress from 'nprogress';
import NProgress from 'nprogress';

NProgress.configure({ showSpinner: false, easing: 'ease' })

const ProgressRoute = props => {

    React.useState(nprogress.start());

    React.useEffect(() => {
        nprogress.done();
        return () => nprogress.start();
    });

    return (
        <Route {...props} />
    );
};

export default ProgressRoute;