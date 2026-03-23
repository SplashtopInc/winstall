import styles from "../styles/home.module.scss";

import Search from "../components/Search";
import PopularApps from "../components/PopularApps";
import MetaTags from "../components/MetaTags";
import Recommendations from "../components/Recommendations";

import Footer from "../components/Footer";
import { shuffleArray } from "../utils/helpers";
import popularAppsList from "../data/popularApps.json";
// import FeaturePromoter from "../components/FeaturePromoter";
import Link from "next/link";
import { FiPlus, FiPackage } from "react-icons/fi";
import fetchWinstallAPI from "../utils/fetchWinstallAPI";
import Error from "../components/Error";
import DonateCard from "../components/DonateCard";
import { useState, useEffect } from "react";
import { getRevalidateTime } from "../utils/revalidateCache";

function Home({ popular, apps, appsTotal, recommended, error}) {
  const [data, setData] = useState({ popular, apps, appsTotal, recommended });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If data is empty, try to load it client-side
    if (data.apps.length === 0 && !loading && !error) {
      setLoading(true);

      const loadData = async () => {
        const { response: appsData } = await fetchWinstallAPI('/apps');
        if (appsData) {
          const normalizeAppsPayload = (payload) => {
            if (!payload) return [];
            if (Array.isArray(payload)) return payload;
            if (Array.isArray(payload.apps)) return payload.apps;
            if (Array.isArray(payload.items)) return payload.items;
            if (Array.isArray(payload.data)) return payload.data;
            return [];
          };

          const appsList = normalizeAppsPayload(appsData);
          const total = typeof appsData?.total === "number" ? appsData.total : appsList.length;

          // Use popularApps.json as fallback for popular apps
          const popularList = data.popular.length > 0 ? data.popular : shuffleArray(Object.values(popularAppsList)).slice(0, 16);

          setData({
            apps: appsList,
            appsTotal: total,
            popular: popularList,
            recommended: data.recommended
          });
        }
        setLoading(false);
      };

      loadData();
    }
  }, [data, loading, error]);

  if(error) {
    return <Error title="Oops!" subtitle={error}/>
  }

  const searchLabel = `${Math.floor(data.appsTotal / 50) * 50}+ packages and growing.`;

  return (
    <div>
      <MetaTags title="Browse the winget repository - winstall" />
      <div className={styles.intro}>
        <div className="illu-box">
          <div>
            <h1>
              Browse the winget repository.
            </h1>
            <p className={styles.lead}>
              Install Windows apps quickly with Windows Package Manager.
            </p>
            <Search apps={data.apps} label={searchLabel} limit={4}/>
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


      <PopularApps apps={data.popular} all={data.apps} />

      {/* <RecentApps apps={recents} /> */}

      {/* <FeaturePromoter art="/assets/packsPromo.svg" promoId="packs">
        <h3>Introducing Packs</h3>
        <h1>Curate and share the apps you use daily.</h1>
        <div className="box2">
            <Link href="/packs/create"><button className="button spacer accent" id="starWine"><FiPlus/> Create a pack</button></Link>
            <Link href="/packs/"><button className="button"><FiPackage/> View packs</button></Link>
        </div>
      </FeaturePromoter> */}

      <Footer />
    </div>
  );
}

export async function getStaticProps(){
  let popular = shuffleArray(Object.values(popularAppsList));

  let { response: apps, error: appsError } = await fetchWinstallAPI(`/apps`);
  let { response: recommended, error: recommendedError } = await fetchWinstallAPI(`/packs/users/${process.env.NEXT_OFFICIAL_PACKS_CREATOR}`);

  if(appsError) console.error(appsError);
  if(recommendedError) console.error(recommendedError);

  const normalizeAppsPayload = (payload) => {
    if (!payload) return [];
    // New unified structure: { data, total, offset, limit }
    if (Array.isArray(payload.data)) return payload.data;
    // Legacy fallback
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.apps)) return payload.apps;
    if (Array.isArray(payload.items)) return payload.items;

    return [];
  };

  const appsList = normalizeAppsPayload(apps);
  const appsTotal = typeof apps?.total === "number" ? apps.total : appsList.length;

  // Normalize recommended packs
  const recommendedList = normalizeAppsPayload(recommended);

  // Use exponential backoff for revalidate when data is unavailable
  const hasData = appsList.length > 0;
  const revalidate = getRevalidateTime('index', hasData);

  if (!hasData) {
    return {
      props: {
        popular: [],
        apps: [],
        appsTotal: 0,
        recommended: []
      },
      revalidate
    };
  }

  if(appsError || recommendedError) return { props: { error: `Could not fetch data from Winstall API.`}, revalidate: getRevalidateTime('index-error', false) };

  const popularResults = await Promise.all(
    popular.map(async (entry) => {
      const { response: appData } = await fetchWinstallAPI(`/apps/${entry._id}`);
      if (!appData) return null;

      return {
        ...appData,
        _id: entry._id,
        path: appData.path || entry.path,
        name: appData.name || entry.name,
        img: entry.img,
      };
    })
  );

  popular = popularResults.filter(Boolean);

  // get the new pack data, and versions data, etc.
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

  return (
    {
      props: {
        popular,
        apps: appsList,
        appsTotal,
        recommended: recommendedList
      },
      revalidate: 600
    }
  )
}

export default Home;
