import styles from "../styles/home.module.scss";

import Search from "../components/Search";
import PopularApps from "../components/PopularApps";
import MetaTags from "../components/MetaTags";
import Recommendations from "../components/Recommendations";

import Footer from "../components/Footer";
import { shuffleArray } from "../utils/helpers";
import popularAppsList from "../data/popularApps.json";
import FeaturePromoter from "../components/FeaturePromoter";
import Link from "next/link";
import { FiPlus, FiPackage } from "react-icons/fi";
import fetchWinstallAPI from "../utils/fetchWinstallAPI";
import Error from "../components/Error";
import DonateCard from "../components/DonateCard";
import { useState, useEffect } from "react";
import { getRevalidateTime } from "../utils/revalidateCache";

function Home({ popular, appsTotal, recommended, error, buildTime, officialPacksCreator }) {
  const twitterLoginEnabled = process.env.NEXT_PUBLIC_TWITTER_LOGIN === 'true';
  const [data, setData] = useState({ popular: popular || [], appsTotal: appsTotal || 0, recommended: recommended || [] });
  const [isLoading, setIsLoading] = useState(buildTime || (!popular && !error));
  const [clientError, setClientError] = useState(null);

  useEffect(() => {
    if (buildTime || (!popular && !error)) {
      setIsLoading(true);

      Promise.all([
        fetchWinstallAPI(`/apps`).then(({ response }) => response),
        fetchWinstallAPI(`/packs/users/${officialPacksCreator}`).then(({ response }) => response)
      ])
        .then(([appsResponse, packsResponse]) => {
          const total = typeof appsResponse?.total === "number" ? appsResponse.total : 0;

          const normalizePayload = (payload) => {
            if (!payload) return [];
            if (Array.isArray(payload.data)) return payload.data;
            if (Array.isArray(payload)) return payload;
            if (Array.isArray(payload.apps)) return payload.apps;
            if (Array.isArray(payload.items)) return payload.items;
            return [];
          };

          setData({
            popular: popular || [],
            appsTotal: total,
            recommended: normalizePayload(packsResponse)
          });
          setIsLoading(false);
        })
        .catch(err => {
          setClientError(err.message || "Failed to load data");
          setIsLoading(false);
        });
    }
  }, [buildTime, popular, error, officialPacksCreator]);

  if (isLoading) {
    return (
      <div>
        <MetaTags title="Browse the winget repository - winstall" path="/" />
        <div className={styles.intro}>
          <div className="illu-box">
            <div>
              <h1>Browse the winget repository.</h1>
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
      <MetaTags title="Browse the winget repository - winstall" path="/" />
      <div className={styles.intro}>
        <div className="illu-box">
          <div>
            <h1>
              Browse the winget repository.
            </h1>
            <p className={styles.lead}>
              Install Windows apps quickly with Windows Package Manager.
            </p>
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

      <DonateCard />


      <PopularApps apps={data.popular} />

      {/* <RecentApps apps={recents} /> */}

      {twitterLoginEnabled && (
        <FeaturePromoter art="/assets/packsPromo.svg" promoId="packs">
              <h3>Introducing Packs</h3>
              <h1>Curate and share the apps you use daily.</h1>
              <div className="box2">
                  <Link href="/packs/create" className="button spacer accent" id="starWine"><FiPlus/> Create a pack</Link>
                  <Link href="/packs/" className="button"><FiPackage/> View packs</Link>
              </div>
        </FeaturePromoter>
      )}

      <Footer />
    </div>
  );
}

export async function getStaticProps(){
  const { getRuntimeConfig } = require('../utils/runtimeConfig');
  const config = await getRuntimeConfig();

  const officialPacksCreator = process.env.NEXT_OFFICIAL_PACKS_CREATOR || '1301830924120788997';

  // No API at build time: return empty to trigger ISR on first request
  if (!config.apiBase) {
    console.warn('[getStaticProps /] Build-time: no API configured, will trigger ISR on first request');
    return {
      props: {
        popular: shuffleArray(Object.values(popularAppsList)).slice(0, 16),
        appsTotal: 0,
        recommended: [],
        buildTime: true,
        officialPacksCreator
      },
      revalidate: 1
    };
  }

  let popular = shuffleArray(Object.values(popularAppsList));

  let { response: apps, error: appsError } = await fetchWinstallAPI(`/apps`);
  let { response: recommended, error: recommendedError } = await fetchWinstallAPI(`/packs/users/${officialPacksCreator}`);

  const normalizeAppsPayload = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.apps)) return payload.apps;
    if (Array.isArray(payload.items)) return payload.items;
    return [];
  };

  const appsTotal = typeof apps?.total === "number" ? apps.total : 0;
  const recommendedList = normalizeAppsPayload(recommended);
  const hasData = appsTotal > 0;

  // Runtime API error: use exponential backoff to avoid hammering failing API
  if (!hasData || appsError || recommendedError) {
    const errorMsg = appsError || recommendedError || 'Failed to load data from API server';
    const revalidate = getRevalidateTime('index', false);

    console.warn(`[getStaticProps /] Runtime: no data, will retry in ${revalidate}s`);

    return {
      props: {
        popular: popular.slice(0, 16),
        appsTotal: 0,
        recommended: [],
        error: errorMsg,
        officialPacksCreator
      },
      revalidate
    };
  }

  const popularResults = await Promise.all(
    popular.slice(0, 16).map(async (entry) => {
      const { response: appData } = await fetchWinstallAPI(`/apps/${entry._id}?exclude=versions`);

      if (!appData) {
        return entry;
      }

      return {
        ...appData,
        _id: entry._id,
        img: entry.img,
      };
    })
  );

  popular = popularResults.filter(Boolean);

  const getPackData = recommendedList.map(async (pack) => {
    return new Promise(async(resolve) => {
      const appsList = pack.apps;

      const getIndividualApps = appsList.map(async (app, index) => {
        return new Promise(async (resolve) => {
          let { response: appData, error } = await fetchWinstallAPI(`/apps/${app._id}`);

          if(error) appData = null;

          appsList[index] = appData;
          resolve();
        })
      })

      await Promise.all(getIndividualApps).then(() => {
        pack.apps = appsList.filter(app => app != null);
        resolve();
      })
    })
  })

  await Promise.all(getPackData);

  const revalidate = getRevalidateTime('index', true);
  console.log(`[getStaticProps /] Success: ${appsTotal} apps, ${recommendedList.length} packs, revalidate in ${revalidate}s`);

  return {
    props: {
      popular,
      appsTotal,
      recommended: recommendedList,
      officialPacksCreator
    },
    revalidate
  };
}

export default Home;
