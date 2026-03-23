import { useContext, useEffect, useState } from "react";
import Link from "next/link";

import styles from "../styles/home.module.scss";

import ListPackages from "../components/ListPackages";
import SingleApp from "../components/SingleApp";
import SelectedContext from "../ctx/SelectedContext";

import Footer from "../components/Footer";

import { FiHome } from "react-icons/fi";
import MetaTags from "../components/MetaTags";
import ExportApps from "../components/AppExport/ExportApps";

function Generate() {
    const { selectedApps } = useContext(SelectedContext);
    const [apps, setApps] = useState([]);

    useEffect(() => {
      setApps(selectedApps);
    }, [ apps, selectedApps ]);

    if(selectedApps.length === 0){
      return (
        <div className="generate-container">
          <MetaTags title="Generate a WinGet Install Script | winstall" path="/generate" desc="Turn your selected apps into a WinGet install script or PowerShell command for faster Windows app deployment." />
          <div className="illu-box">
            <div className={styles.generate}>
              <h1>Your don't have any apps selected.</h1>
              <h3>
                Make sure you select some apps first to be able to generate a
                script :)
              </h3>
              <Link href="/" className="button">
                <FiHome />
                Go home
              </Link>
            </div>
            <div className="art">
              <img
                src="/assets/dl.svg"
                draggable={false}
                alt="download icon"
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="generate-container">
        <MetaTags title="Generate a WinGet Install Script | winstall" path="/generate" desc="Turn your selected apps into a WinGet install script or PowerShell command for faster Windows app deployment." />
        <div className="illu-box">
          <div className={styles.generate}>
            <h1>Your apps are ready to be installed.</h1>
            <h3>Make sure you have Windows Package Manager installed :)</h3>

            <ExportApps apps={apps} />
          </div>
          <div className="art">
            <img src="/assets/dl.svg" draggable={false} alt="download icon" />
          </div>
        </div>

        <div className={styles.selectedApps}>
          <h2>Apps you are downloading ({selectedApps.length})</h2>
          <ListPackages showImg={true}>
            {selectedApps.map((app) => (
              <SingleApp app={app} key={app._id} onVersionChange={setApps}/>
            ))}
          </ListPackages>
        </div>

        <Footer />
      </div>
    );
}

export default Generate;
