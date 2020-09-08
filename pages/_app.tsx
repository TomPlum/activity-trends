import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/sass/global/styles.scss';
import '../assets/sass/global/activity-rings.scss';
import '../assets/sass/global/recharts.scss';
import '../assets/sass/global/react-bootstrap.scss';
import '@fortawesome/fontawesome-svg-core/styles.css'
import { config } from "@fortawesome/fontawesome-svg-core";
import type { AppProps } from 'next/app'
import MainLayout from '../src/layout/Main';
import Head from 'next/head'

config.autoAddCss = false;

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <title>Activity Trends</title>
                <link rel="icon" href="/favicon.ico" />
                <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,500;1,700;1,900&display=swap" rel="stylesheet"></link>
            </Head>

            <MainLayout>
                <Component {...pageProps} />
            </MainLayout>
        </>
    )
}

export default MyApp;