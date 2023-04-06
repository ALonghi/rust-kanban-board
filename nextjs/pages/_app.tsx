// add bootstrap css
import type { AppProps } from "next/app";
import "../styles/global.css"

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <main className={`relative`}>
            <Component {...pageProps} />
        </main>
    );
}

export default MyApp;
