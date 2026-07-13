import styles from "../styles/home.module.scss";

import Search from "../components/Search";
import PopularApps from "../components/PopularApps";
import MetaTags from "../components/MetaTags";
import Recommendations from "../components/Recommendations";

import Footer from "../components/Footer";
import { shuffleArray } from "../utils/helpers";
import popularAppsList from "../data/popularApps.json";
import fetchWinstallAPI from "../utils/fetchWinstallAPI";
import Error from "../components/Error";
import DonateCard from "../components/DonateCard";
import { useState, useEffect } from "react";
import { getRevalidateTime } from "../utils/revalidateCache";

function Home({ popular, appsTotal, recommended, error, buildTime }) {
  const [data, setData] = useState({ popular: popular || [], appsTotal: appsTotal || 0, recommended: recommended || [] });
  const [isLoading, setIsLoading] = useState(buildTime || (!popular && !error));
  const [clientError, setClientError] = useState(null);

  useEffect(() => {
    if (buildTime || (!popular && !error)) {
      setIsLoading(true);

      fetchWinstallAPI(`/apps`)
        .then(({ response }) => {
          const total = typeof response?.total === "number" ? response.total : 0;

          setData({
            popular: popular || [],
            appsTotal: total,
            recommended: recommended || []
          });
          setIsLoading(false);
        })
        .catch(err => {
          setClientError(err.message || "Failed to load data");
          setIsLoading(false);
        });
    }
  }, [buildTime, popular, error, recommended]);

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

      {data.recommended && data.recommended.length > 0 && (
        <Recommendations packs={data.recommended} />
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
        buildTime: true
      },
      revalidate: 1
    };
  }

  let popular = shuffleArray(Object.values(popularAppsList));

  let { response: apps, error: appsError } = await fetchWinstallAPI(`/apps`);

  // Query recommended packs from local MongoDB
  let recommendedList = [];
  try {
    const { connectMongoose } = require('../lib/mongoose');
    const mongoose = await connectMongoose();

    // Import Pack model to register it
    require('../dbModel/Pack');
    const Pack = mongoose.models.Pack;

    if (!Pack) {
      console.warn('[getStaticProps /] Pack model not found, skipping recommended packs');
    } else {
      const packs = await Pack.find({
        userId: officialPacksCreator,
        visibility: 'public',
        status: 'active'
      })
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      recommendedList = packs;
      console.log(`[getStaticProps /] Loaded ${recommendedList.length} recommended packs from MongoDB`);
    }
  } catch (err) {
    // MongoDB might not be available during build time, which is OK
    const errMsg = err instanceof Error ? err.message : String(err);
    console.warn('[getStaticProps /] MongoDB not available for recommended packs:', errMsg);
  }

  const appsTotal = typeof apps?.total === "number" ? apps.total : 0;
  const hasData = appsTotal > 0;

  // Runtime API error: use exponential backoff to avoid hammering failing API
  if (!hasData || appsError) {
    const errorMsg = appsError || 'Failed to load data from API server';
    const revalidate = getRevalidateTime('index', false);

    console.warn(`[getStaticProps /] Runtime: no data, will retry in ${revalidate}s`);

    return {
      props: {
        popular: popular.slice(0, 16),
        appsTotal: 0,
        recommended: [],
        error: errorMsg
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

  // Enrich pack apps with API data
  const getPackData = recommendedList.map(async (pack) => {
    return new Promise(async(resolve) => {
      const appsList = pack.apps || [];

      const getIndividualApps = appsList.map(async (app, index) => {
        return new Promise(async (resolve) => {
          const appId = app.appId || app._id;
          if (!appId) {
            appsList[index] = null;
            resolve();
            return;
          }

          let { response: appData, error } = await fetchWinstallAPI(`/apps/${appId}`);

          if(error) {
            appData = null;
          } else {
            // Merge pack app data with API data
            appData = {
              ...appData,
              _id: appId,
              name: app.appName || appData.name,
              icon: app.icon || appData.icon,
              iconUrl: app.iconUrl,
              iconPng: app.iconPng,
              publisher: app.publisher || appData.publisher
            };
          }

          appsList[index] = appData;
          resolve();
        })
      })

      await Promise.all(getIndividualApps).then(() => {
        pack.apps = appsList.filter(app => app != null);
        // Add compatibility fields for Recommendations component
        pack.title = pack.name;
        pack.desc = pack.description;
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
      recommended: recommendedList
    },
    revalidate
  };
}

export default Home;
