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
import { useState } from "react";
import { getRevalidateTime } from "../utils/revalidateCache";

function Home({ popular, appsTotal, recommended, error}) {
  const [data] = useState({ popular, appsTotal, recommended });

  if(error) {
    return <Error title="Oops!" subtitle={error}/>
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
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.apps)) return payload.apps;
    if (Array.isArray(payload.items)) return payload.items;
    return [];
  };

  const appsTotal = typeof apps?.total === "number" ? apps.total : 0;
  const recommendedList = normalizeAppsPayload(recommended);

  const hasData = appsTotal > 0;
  const revalidate = getRevalidateTime('index', hasData);

  if (!hasData) {
    return {
      props: {
        popular: [],
        appsTotal: 0,
        recommended: []
      },
      revalidate
    };
  }

  if(appsError || recommendedError) return { props: { error: `Could not fetch data from Winstall API.`}, revalidate: getRevalidateTime('index-error', false) };

  // Fetch popular apps from API with exclude=versions to avoid large payload
  // Fallback to popularApps.json if API is unavailable
  const popularResults = await Promise.all(
    popular.slice(0, 16).map(async (entry) => {
      const { response: appData } = await fetchWinstallAPI(`/apps/${entry._id}?exclude=versions`);

      if (!appData) {
        // Fallback to static popularApps.json data
        return entry;
      }

      return {
        ...appData,
        _id: entry._id,
        img: entry.img, // Preserve img from popularApps.json for consistency
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
        appsTotal,
        recommended: recommendedList
      },
      revalidate: 600
    }
  )
}

export default Home;
