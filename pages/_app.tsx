import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/sass/global/styles.scss';
import '../assets/sass/global/activity-rings.scss';
import '../assets/sass/global/recharts.scss';
import '../assets/sass/global/react-bootstrap.scss';
import 'nprogress/nprogress.css';
import '@fortawesome/fontawesome-svg-core/styles.css'
import Router from 'next/router';
import NProgress from 'nprogress';
import { config } from "@fortawesome/fontawesome-svg-core";
import MainLayout from '../src/layout/Main';
import Head from 'next/head'
import React from 'react';
import LoadingSpinner from '../src/layout/LoadingSpinner';

config.autoAddCss = false;

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());
NProgress.configure({ showSpinner: false, easing: 'ease' });
 

export default function MyApp({ Component, pageProps }) {
    const [loading, setLoading] = React.useState(false);

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
    }, []);

    return (
        <>
            <Head>
                <title>Activity Trends</title>
                <link rel="icon" href="/favicon.ico" />
                <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,500;1,700;1,900&display=swap" rel="stylesheet"></link>
            </Head>

            <MainLayout>
                <LoadingSpinner active={loading} />
                <Component {...pageProps} />
            </MainLayout>
        </>
    );
}