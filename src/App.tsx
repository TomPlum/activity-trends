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
import { ActivityTrendsService } from '../src/service/ActivityTrendsService';
import SnapshotContextProvider from '../src/infrastructure/context/SnapshotContextProvider';
import { InfoService } from '../src/service/InfoService';
import { AppInformation } from '../src/domain/AppInformation';
import { SnapshotDates } from '../src/domain/SnapshotDates';
import { Component } from 'react';

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
    appInfo: AppInformation;
    loading: boolean;
}

export default class App extends Component<{}, AppState> {
    constructor(props) {
        super(props);

        this.state = {
            appInfo: AppInformation.empty(),
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
        const appInfo: AppInformation = await new InfoService().getInfo();
        this.setState({ appInfo });
    }

    render() {
        const { appInfo, loading } = this.state;
        return (
            <>
                <SnapshotContextProvider storeSnapshotDates={undefined}>
                    <MainLayout snapshotDates={undefined} appInfo={appInfo}>
                        <LoadingSpinner active={loading} />
                        {this.props.children}
                    </MainLayout>
                </SnapshotContextProvider>

            </>
        );
    }
}