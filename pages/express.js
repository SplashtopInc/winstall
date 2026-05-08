import styles from "../styles/home.module.scss";

import Search from "../components/Search";
import Categories from "../components/Categories";
import MetaTags from "../components/MetaTags";

import Footer from "../components/Footer";
import categoryAppsList from "../data/categoryApps.json";
import fetchWinstallAPI from "../utils/fetchWinstallAPI";
import Error from "../components/Error";
import { useState, useEffect } from "react";
import { getRevalidateTime } from "../utils/revalidateCache";

function ExpressSetup({ appsTotal, error, buildTime }) {
  const [data, setData] = useState({ appsTotal: appsTotal || 0 });
  const [isLoading, setIsLoading] = useState(buildTime || !error);
  const [clientError, setClientError] = useState(null);

  useEffect(() => {
    if (buildTime || !error) {
      setIsLoading(true);

      fetchWinstallAPI(`/apps`)
        .then(({ response }) => {
          const total = typeof response?.total === "number" ? response.total : 0;
          setData({ appsTotal: total });
          setIsLoading(false);
        })
        .catch(err => {
          setClientError(err.message || "Failed to load data");
          setIsLoading(false);
        });
    }
  }, [buildTime, error]);

  if (isLoading) {
    return (
      <div>
        <MetaTags title="Pick the apps you want - winstall" path="/express" />
        <div className={styles.intro}>
          <div className="illu-box">
            <div>
              <h1>Pick the apps you want</h1>
              <p className={styles.lead}>Loading...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return <Error title="Oops!" subtitle={error} />;
  }

  if (clientError) {
    return <Error title="Oops!" subtitle={clientError} />;
  }

  const searchLabel = `${Math.floor(data.appsTotal / 50) * 50}+ packages and growing.`;

  return (
    <div>
      <MetaTags title="Pick the apps you want - winstall" path="/express" />
      <div className={styles.intro}>
        <div className="illu-box">
          <div>
            <h1>Pick the apps you want</h1>
            <p className={styles.lead}>Here are the most popular apps, you can pick and install them instantly.</p>
            <Search label={searchLabel} limit={4}/>
          </div>
          <div className="art">
              <img
                src="/assets/logo.svg"
                draggable={false}
                alt="winstall logo"
              />
            </div>
        </div>
      </div>

      {Object.entries(categoryAppsList).map(([key, apps]) => {
        if (!Array.isArray(apps) || apps.length === 0) return null;

        const categoryName = key
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        return (
          <Categories
            key={key}
            apps={apps}
            category={categoryName}
          />
        );
      })}

      <Footer />
    </div>
  );
}

export async function getStaticProps(){
  const { getRuntimeConfig } = require('../utils/runtimeConfig');
  const config = await getRuntimeConfig();

  // No API at build time: return empty to trigger ISR on first request
  if (!config.apiBase) {
    console.warn('[getStaticProps /express] Build-time: no API configured, will trigger ISR on first request');
    return {
      props: {
        appsTotal: 0,
        buildTime: true
      },
      revalidate: 1
    };
  }

  let { response: apps, error: appsError } = await fetchWinstallAPI(`/apps`);

  const appsTotal = typeof apps?.total === "number" ? apps.total : 0;
  const hasData = appsTotal > 0;

  // Runtime API error: use exponential backoff to avoid hammering failing API
  if (!hasData || appsError) {
    const errorMsg = appsError || 'Failed to load data from API server';
    const revalidate = getRevalidateTime('express', false);

    console.warn(`[getStaticProps /express] Runtime: no data, will retry in ${revalidate}s`);

    return {
      props: {
        appsTotal: 0,
        error: errorMsg
      },
      revalidate
    };
  }

  const revalidate = getRevalidateTime('express', true);
  console.log(`[getStaticProps /express] Success: ${appsTotal} apps, revalidate in ${revalidate}s`);

  return {
    props: {
      appsTotal
    },
    revalidate
  };
}

export default ExpressSetup;
