import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/sass/global/styles.scss';
import './assets/sass/global/activity-rings.scss';
import './assets/sass/global/recharts.scss';
import './assets/sass/global/react-bootstrap.scss';
import 'nprogress/nprogress.css';
import '@fortawesome/fontawesome-svg-core/styles.css'
import NProgress from 'nprogress';
import { config } from "@fortawesome/fontawesome-svg-core";
import MainLayout from '../src/layout/Main';
import React from 'react';
import LoadingSpinner from '../src/layout/LoadingSpinner';
import SnapshotContextProvider from '../src/infrastructure/context/SnapshotContextProvider';
import { Component } from 'react';
import { HashRouter } from 'react-router-dom'

config.autoAddCss = false;

/* Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done()); */
NProgress.configure({ showSpinner: false, easing: 'ease' });

interface AppProps {
    'Component': React.FC;
    pageProps: any;
}

interface AppState {
    loading: boolean;
}

export default class App extends Component<{}, AppState> {
    constructor(props) {
        super(props);

        this.state = {
            loading: false
        }
    }
    /*  const [loading, setLoading] = React.useState(false);
 
     React.useEffect(() => {
         const start = () => { setLoading(true); };
         const stop = () => { setLoading(false); };
 
         Router.events.on("routeChangeStart", start);
         Router.events.on("routeChangeComplete", stop);
         Router.events.on("routeChangeError", stop);
 
         return () => {
             Router.events.off("routeChangeStart", start);
             Router.events.off("routeChangeComplete", stop);
             Router.events.off("routeChangeError", stop);
         };
     }, []); */

    async componentDidMount() {
        //const snapshotDates: SnapshotDates = await new ActivityTrendsService().getSnapshotDates();
    }

    render() {
        const { loading } = this.state;
        return (
            <>
                <SnapshotContextProvider storeSnapshotDates={undefined}>
                    <HashRouter basename={process.env.REACT_APP_BASE_PATH}>
                        <MainLayout snapshotDates={undefined} >
                            <LoadingSpinner active={loading} />
                        </MainLayout>
                    </HashRouter>
                </SnapshotContextProvider>
            </>
        );
    }
}