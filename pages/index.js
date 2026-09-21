import styles from "../styles/home.module.scss";

import MetaTags from "../components/MetaTags";
import HomeCarousel from "../components/homeCarousel";
import TopCategories from "../components/topCategories";
import TrendingApps from "../components/trendingApps";
import TrendingPacks from "../components/trendingPacks";

import Footer from "../components/Footer";
import fetchWinstallAPI from "../utils/fetchWinstallAPI";
import {
  fetchAppTrending,
  fetchPackTrending,
} from "../utils/trendingApi";
import Error from "../components/Error";
import { useState, useEffect } from "react";
import { getRevalidateTime } from "../utils/revalidateCache";
import { useAppsTotal } from "../ctx/appsTotalContext";

function Home({
  appsTotal,
  trendingApps = [],
  trendingPacks = [],
  error,
  buildTime,
}) {
  const { setAppsTotal } = useAppsTotal();
  const [data, setData] = useState({
    appsTotal: appsTotal || 0,
    trendingApps,
    trendingPacks,
  });
  const [isLoading, setIsLoading] = useState(Boolean(buildTime) && !error);
  const [clientError, setClientError] = useState(null);

  useEffect(() => {
    if (!buildTime) return;

    setIsLoading(true);

    Promise.all([
      fetchWinstallAPI("/apps"),
      fetchAppTrending(),
      fetchPackTrending(),
    ])
      .then(([appsResult, appTrendingResult, packTrendingResult]) => {
        const response = appsResult.response;
        const total = typeof response?.total === "number" ? response.total : 0;

        setData({
          appsTotal: total,
          trendingApps: appTrendingResult.items,
          trendingPacks: packTrendingResult.items,
        });
        setIsLoading(false);
      })
      .catch(err => {
        setClientError(err.message || "Failed to load data");
        setIsLoading(false);
      });
  }, [buildTime]);

  useEffect(() => {
    if (typeof data.appsTotal === "number" && data.appsTotal > 0) {
      setAppsTotal(data.appsTotal);
    }
  }, [data.appsTotal, setAppsTotal]);

  if (isLoading) {
    return (
      <div>
        <MetaTags title="Browse the winget repository - winstall" path="/" />
        <h1 className={styles.srOnly}>Browse the winget repository.</h1>
        <p className={styles.loadingNote}>Loading...</p>
        <Footer />
      </div>
    );
  }

  if (error) {
    return <Error detail={error} />;
  }

  if (clientError) {
    return <Error detail={clientError} />;
  }

  return (
    <div>
      <MetaTags title="Browse the winget repository - winstall" path="/" />
      <h1 className={styles.srOnly}>Browse the winget repository.</h1>

      <HomeCarousel
        topApp={data.trendingApps[0]}
        trendingPacks={data.trendingPacks}
      />

      <TopCategories />

      <TrendingApps apps={data.trendingApps} />
      <TrendingPacks packs={data.trendingPacks} />

      <Footer />
    </div>
  );
}

export async function getStaticProps(){
  const { getPublicApiBase } = require('../utils/runtimeConfig');

  // No public API origin at build time: return empty to trigger ISR on first request
  if (!getPublicApiBase()) {
    console.warn('[getStaticProps /] Build-time: no API configured, will trigger ISR on first request');
    return {
      props: {
        appsTotal: 0,
        trendingApps: [],
        trendingPacks: [],
        buildTime: true
      },
      revalidate: 1
    };
  }

  const [appsResult, appTrendingResult, packTrendingResult] = await Promise.all([
    fetchWinstallAPI("/apps"),
    fetchAppTrending(),
    fetchPackTrending(),
  ]);
  const { response: apps, error: appsError } = appsResult;
  const trendingApps = appTrendingResult.error
    ? []
    : appTrendingResult.items;
  const trendingPacks = packTrendingResult.error
    ? []
    : packTrendingResult.items;

  const appsTotal = typeof apps?.total === "number" ? apps.total : 0;
  const hasData = appsTotal > 0;

  // Runtime API error: use exponential backoff to avoid hammering failing API
  if (!hasData || appsError) {
    const errorMsg = appsError || 'Failed to load data from API server';
    const revalidate = getRevalidateTime('index', false);

    console.warn(`[getStaticProps /] Runtime: no data, will retry in ${revalidate}s`);

    return {
      props: {
        appsTotal: 0,
        trendingApps,
        trendingPacks,
        error: errorMsg
      },
      revalidate
    };
  }

  const revalidate = getRevalidateTime('index', true);
  console.log(
    `[getStaticProps /] Success: ${appsTotal} apps, ${trendingApps.length} trending apps, ${trendingPacks.length} trending packs, revalidate in ${revalidate}s`
  );

  return {
    props: {
      appsTotal,
      trendingApps,
      trendingPacks,
    },
    revalidate
  };
}

export default Home;
