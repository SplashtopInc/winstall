import { useContext, useEffect, useState } from "react";
import Link from "next/link";

import styles from "../styles/home.module.scss";

import PackDetailAppCard from "../components/PackDetailAppCard";
import SelectedContext from "../ctx/SelectedContext";
import AppSettingsDrawer from "../components/AppSettingsDrawer";
import { DEFAULT_INSTALL_FILTERS } from "../utils/defaultInstallOptions";
import packStyles from "../styles/packDetail.module.scss";

import Footer from "../components/Footer";

import MetaTags from "../components/MetaTags";
import ExportApps from "../components/AppExport/ExportApps";
import {
  ensureAppsBasics,
  ensureAppsWithVersions,
  isAppBasicsIncomplete,
  isAppVersionsMissing,
} from "../utils/ensureAppBasics";
import { getDocumentShellStaticProps } from "../utils/documentShellStaticProps";

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
        const needsVersions = selectedApps.some(isAppVersionsMissing);
        const needsBasics = selectedApps.some(isAppBasicsIncomplete);

        let nextSelected = selectedApps;
        if (needsVersions) {
          nextSelected = await ensureAppsWithVersions(selectedApps);
        } else if (needsBasics) {
          nextSelected = await ensureAppsBasics(selectedApps);
        }

        if (cancelled) return;

        if (nextSelected.some((app, i) => app !== selectedApps[i])) {
          setSelectedApps(nextSelected);
        }

        setApps((prevApps) => {
          return nextSelected.map((app) => {
            const existingApp = prevApps.find((a) => a._id === app._id);

            if (!existingApp) return app;

            return {
              ...app,
              installOptions: existingApp.installOptions,
              versions: app.versions?.length ? app.versions : existingApp.versions,
              selectedVersion: app.selectedVersion || existingApp.selectedVersion,
              latestVersion: app.latestVersion || existingApp.latestVersion,
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

    const handleDeleteApp = (appId) => {
      setSelectedApps((prev) => prev.filter((a) => a._id !== appId));
      setApps((prev) => prev.filter((a) => a._id !== appId));
      setSelectedAppForSettings((prevApp) => {
        if (!prevApp || prevApp._id !== appId) return prevApp;
        setDrawerOpen(false);
        return null;
      });
    };

    const handleVersionChange = (app, nextVersion) => {
      if (!nextVersion) return;
      const apply = (list) =>
        list.map((item) =>
          item._id === app._id
            ? { ...item, selectedVersion: nextVersion, appVersion: nextVersion }
            : item
        );
      setApps(apply);
      setSelectedApps(apply);
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

      // Sync installOptions back to selectedApps context for persistence
      setSelectedApps((prevApps) => prevApps.map((a) => {
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
          <div className={styles.generateHero}>
            <h1>No apps selected</h1>
            <p className={styles.lead}>
              Pick apps first, then come back to generate a winget command or installer.
            </p>
            <Link href="/" className="button accent">
              Browse apps
            </Link>
          </div>
          <Footer />
        </div>
      );
    }

    return (
      <div className="generate-container">
        <MetaTags title="Generate a WinGet Install Script | winstall" path="/generate" desc="Turn your selected apps into a WinGet install script or PowerShell command for faster Windows app deployment." />
        <div className={styles.generateHero}>
          <h1>Your apps are ready</h1>
          <p className={styles.lead}>Make sure you have Windows Package Manager installed :)</p>

          <ExportApps
            apps={apps}
            initialFilters={filters}
            onDefaultFiltersChange={setDefaultInstallOptions}
          />
        </div>

        <div className={styles.selectedApps}>
          <div className={styles.selectedHead}>
            <h2 className={styles.selectedTitle}>Selected apps ({apps.length})</h2>
            <Link href="/" className={styles.selectedMore}>
              Add more
            </Link>
          </div>
          <ul className={packStyles.appGrid}>
            {apps.map((app) => (
              <li key={app._id}>
                <PackDetailAppCard
                  app={app}
                  showActions
                  onConfig={handleSettingsClick}
                  onDelete={handleDeleteApp}
                  onVersionChange={handleVersionChange}
                />
              </li>
            ))}
          </ul>
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

export async function getStaticProps() {
  return getDocumentShellStaticProps();
}
