//import '../styles/globals.css'
import Layout from '../components/layout/layout'
import './../styles/globals.css'
import Head from "next/head";
import Script from "next/script";
import original from 'react95/dist/themes/original';
import { ThemeProvider } from 'styled-components';


function MyApp({ Component, pageProps }) {
return (
	<>
	<Head> 
	<title>FTP_NEXT</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
	<link href="https://fonts.googleapis.com/css2?family=Thasadith&family=VT323&display=swap" rel="stylesheet" />
	</Head>

	<ThemeProvider theme={original}>
	<Layout>
	<Component {...pageProps} />
	</Layout>
	</ThemeProvider>
	</>
)
}

export default MyApp
