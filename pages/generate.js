import { useContext, useEffect, useState } from "react";
import Link from "next/link";

import styles from "../styles/home.module.scss";

import ListPackages from "../components/ListPackages";
import SingleApp from "../components/SingleApp";
import SelectedContext from "../ctx/SelectedContext";
import AppSettingsDrawer from "../components/AppSettingsDrawer";
import { DEFAULT_INSTALL_FILTERS } from "../utils/defaultInstallOptions";

import Footer from "../components/Footer";

import { FiHome } from "react-icons/fi";
import MetaTags from "../components/MetaTags";
import ExportApps from "../components/AppExport/ExportApps";
import {
  ensureAppsBasics,
  isAppBasicsIncomplete,
} from "../utils/ensureAppBasics";

function Generate() {
    const {
      selectedApps,
      setSelectedApps,
      defaultInstallOptions,
      setDefaultInstallOptions,
    } = useContext(SelectedContext);
    const [apps, setApps] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedAppForSettings, setSelectedAppForSettings] = useState(null);

    // Seed session defaults from the code constant whenever generate opens
    // without an existing selection-scoped override.
    useEffect(() => {
      if (selectedApps.length === 0) return;
      if (defaultInstallOptions == null) {
        setDefaultInstallOptions({ ...DEFAULT_INSTALL_FILTERS });
      }
    }, [
      selectedApps.length,
      defaultInstallOptions,
      setDefaultInstallOptions,
    ]);

    const filters = defaultInstallOptions ?? DEFAULT_INSTALL_FILTERS;

    useEffect(() => {
      let cancelled = false;

      const syncApps = async () => {
        const needsEnrich = selectedApps.some(isAppBasicsIncomplete);
        const nextSelected = needsEnrich
          ? await ensureAppsBasics(selectedApps)
          : selectedApps;

        if (cancelled) return;

        if (needsEnrich) {
          const changed = nextSelected.some((app, i) => app !== selectedApps[i]);
          if (changed) {
            setSelectedApps(nextSelected);
          }
        }

        setApps((prevApps) => {
          return nextSelected.map((app) => {
            const existingApp = prevApps.find((a) => a._id === app._id);

            if (!existingApp) return app;

            return {
              ...app,
              installOptions: existingApp.installOptions,
            };
          });
        });
      };

      syncApps();

      return () => {
        cancelled = true;
      };
    }, [selectedApps, setSelectedApps]);

    const handleSettingsClick = (app) => {
      const appFromState = apps.find((a) => a._id === app._id) || app;
      setSelectedAppForSettings(appFromState);
      setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
      setDrawerOpen(false);
      setSelectedAppForSettings(null);
    };

    const handleConfigChange = (app, installOptions) => {
      setApps((prevApps) => prevApps.map((a) => {
        if (a._id === app._id) {
          const nextApp = { ...a };
          if (installOptions && Object.keys(installOptions).length > 0) {
            nextApp.installOptions = installOptions;
          } else {
            delete nextApp.installOptions;
          }
          return nextApp;
        }
        return a;
      }));

      setSelectedAppForSettings((prevApp) => {
        if (!prevApp || prevApp._id !== app._id) return prevApp;
        const nextApp = { ...prevApp };
        if (installOptions && Object.keys(installOptions).length > 0) {
          nextApp.installOptions = installOptions;
        } else {
          delete nextApp.installOptions;
        }
        return nextApp;
      });
    };

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

            <ExportApps
              apps={apps}
              initialFilters={filters}
              onDefaultFiltersChange={setDefaultInstallOptions}
            />
          </div>
          <div className="art">
            <img src="/assets/dl.svg" draggable={false} alt="download icon" />
          </div>
        </div>

        <div className={styles.selectedApps}>
          <h2>Apps you are downloading ({apps.length})</h2>
          <ListPackages showImg={true}>
            {apps.map((app) => (
              <SingleApp
                app={app}
                key={app._id}
                onVersionChange={() => setApps((prevApps) => [...prevApps])}
                showSettingsIcon={true}
                onSettingsClick={handleSettingsClick}
                disableSelectedStyle={true}
              />
            ))}
          </ListPackages>
        </div>

        <AppSettingsDrawer
          app={selectedAppForSettings}
          isOpen={drawerOpen}
          onClose={handleCloseDrawer}
          onConfigChange={handleConfigChange}
          defaultFilters={filters}
        />

        <Footer />
      </div>
    );
}

export default Generate;
