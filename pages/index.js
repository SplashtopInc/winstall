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

function Home({ popular, apps, recommended, error}) {
  if(error) {
    return <Error title="Oops!" subtitle={error}/>
  }

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
            <Search apps={apps} limit={4}/>
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


      <PopularApps apps={popular} all={apps} />

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

  if(appsError || recommendedError) return { props: { error: `Could not fetch data from Winstall API.`} };


  // get all apps with id -> filter popular apps for those with an id
  const appsWithId = new Set(Object.values(apps).map((x) => x._id))
  popular = popular.filter((a) => appsWithId.has(a._id))

  // get the new pack data, and versions data, etc.
  const getPackData = recommended.map(async (pack) => {
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
        apps,
        recommended
      }
    }
  )
}

export default Home;
