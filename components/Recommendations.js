import Link from "next/link";

import styles from "../styles/recommendations.module.scss"
import { FiPackage, FiPlus, FiGlobe, FiHome, FiChevronRight, FiCrosshair, FiUserPlus, FiZap, FiMusic, FiCode, FiStar, FiBookOpen } from "react-icons/fi";
import { useEffect, useContext, useState, useRef } from "react";
import PackAppsList from "./PackAppsList";
import AppIcon from "./AppIcon";
import SelectedContext from "../ctx/SelectedContext";
import PackPreview from "./PackPreview";

const Recommendations = ({ packs }) => {
  return (
    <div className="homeBlock">
      <div className="box">
        <h2 className="blockHeader">Featured Packs</h2>
        <Link href="/packs" className="button small">
          <FiPackage />
          View All
        </Link>
      </div>
      <h3 className="blockSubtitle">
        Just got a new Windows device? Start with our favourites. Click the +
        sign to include an app on your install script.
      </h3>

      <div className={styles.recommendations}>
        <PackList id="A6JzO22Y1" title="Work From Home" packs={packs}>
          <FiHome />
        </PackList>

        <PackList id="z3zuf1vVD" title="Web Browsers" packs={packs}>
          <FiGlobe />
        </PackList>

        <PackList id="ur23Tk6Sf" title="Essential Tools" packs={packs}>
          <FiStar />
        </PackList>

        <PackList id="qO_m22F6k" title="Entertainment" packs={packs}>
          <FiMusic />
        </PackList>

        <PackList id="Jtght2FO5" title="Gaming" packs={packs}>
          <FiCrosshair />
        </PackList>

        <PackList id="3glB-CGXA" title="Developers" packs={packs}>
          <FiCode />
        </PackList>

        <PackList id="NYWPVq9ct" title="Social Media" packs={packs}>
          <FiUserPlus />
        </PackList>

        <PackList id="yphy7XItI" title="School" packs={packs}>
          <FiBookOpen />
        </PackList>
      </div>
    </div>
  );
};

const PackList = ({ children, title, id, packs}) => {
  const [packApps, setPackApps] = useState([]);
  const [pack, setPack] = useState();
  const headerRef = useRef(null);

  useEffect(() => {
    if (!packs) return;

    const pack = packs.find(p => p._id === id);

    if(!pack) return;

    setPackApps(pack.apps.slice(0, 5));
    setPack(pack);

  }, []);

  if(!pack) return <></>;

  return (
    <div className={styles.recommendation}>
      <Link href="/packs/[id]" as={`/packs/${pack._id}`} prefetch={false} id={pack.accent} className={styles.packHeader} ref={headerRef}>
        {children}
        <h3>{title}</h3>
        <p>{pack.desc}</p>
      </Link>

      <div className={styles.packListContainer}>
        {packApps && packApps.map((app) => <App key={app._id} data={app} />)}

        <Link href="/packs/[id]" as={`/packs/${pack._id}`} prefetch={false} className={`button subtle ${styles.viewPack}`}>
          View Pack <FiChevronRight />
        </Link>
      </div>
    </div>
  );
};

const App = ({ data }) => {
  const [selected, setSelected] = useState(false);
  const { selectedApps, setSelectedApps } = useContext(SelectedContext);

  useEffect(() => {
    let found = selectedApps.find((a) => a._id === data._id);

    setSelected(found);
  }, [ data, selectedApps ])

  let handleAppSelect = () => {
    let found = selectedApps.findIndex((a) => a._id === data._id);

    if (found !== -1) {
      let updatedSelectedApps = selectedApps.filter(
        (a, index) => index !== found
      );

      setSelectedApps(updatedSelectedApps);
      setSelected(false);

    } else if(data) {
      setSelected(true);

      setSelectedApps([...selectedApps, data]);
    }

  };

  return (
    <div className={`${styles.appContainer} ${selected ? styles.selected : null}`}>

      <Link href="/apps/[id]" as={`/apps/${data._id}`} prefetch={false}>
        <AppIcon name={data.name} icon={data.icon} iconUrl={data.iconUrl} iconPng={data.iconPng} id={data._id}/>
        <h4>{data.name}</h4>
      </Link>
    </div>
  )
}


export default Recommendations;
