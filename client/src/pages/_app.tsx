import "@styles/global.scss";
import type { AppProps } from "next/app";
import Head from "next/head";
import React from "react";
import Sidebar from "@components/shared/Sidebar";
import Notifications from "@components/shared/Notifications/Notifications";

function MyApp({ Component, pageProps }: AppProps) {
    console.log(`envs: ${JSON.stringify(process.env)}`)
    console.log(`NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL}`)
  return (
    <>
      <Head>
        <title>Kanban board</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" href="icons/favicon.svg" />
      </Head>
      <div className="flex flex-row bg-white">
        <Sidebar />
        <Notifications />
        <div className="sm:w-10/12 mx-auto">
          <Component {...pageProps} />
        </div>
      </div>
    </>
  );
}

export default MyApp;
