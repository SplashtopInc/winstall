import React, { useState, useContext, useEffect } from "react";
import styles from "../styles/categoryApp.module.scss";
import SelectedContext from "../ctx/SelectedContext";
import AppIcon from "./AppIcon";
import { ensureAppBasics, isAppBasicsIncomplete } from "../utils/ensureAppBasics";

let CategoryApp = ({ app }) => {
  const [selected, setSelected] = useState(false);
  const { selectedApps, setSelectedApps } = useContext(SelectedContext);

  useEffect(() => {
    let found = selectedApps.findIndex((a) => a._id === app._id) !== -1;

    setSelected(found);
  }, [selectedApps, app._id]);

  let handleAppSelect = async () => {
    let found = selectedApps.findIndex((a) => a._id === app._id);
    if (found !== -1) {
      let updatedSelectedApps = selectedApps.filter(
        (a, index) => index !== found
      );

      setSelectedApps(updatedSelectedApps);
      setSelected(false);
    } else {
      setSelected(true);
      // First open after Docker build may only have {_id, name, img} — fill before select.
      const appToSelect = isAppBasicsIncomplete(app)
        ? await ensureAppBasics(app)
        : app;
      setSelectedApps([...selectedApps, appToSelect]);
    }
  };

  if (!app) return <></>;

  return (
    <li
      key={app._id}
      className={`${styles.app} ${selected ? styles.selected : ""}`}
      onClick={handleAppSelect}
      style={{ cursor: 'pointer' }}
      title={app.desc || app.name}
    >
      <div className={styles.appContent}>
        <div className={styles.iconContainer}>
          <picture>
                <source srcSet={`/assets/apps/${app.img}`}
                        type="image/webp" />
                <source
                srcSet={`/assets/apps/fallback/${app.img.replace(
                    "webp",
                    "png"
                )}`}
                type="image/png"
                />
                <img
                src={`/assets/apps/fallback/${app.img.replace("webp", "png")}`}
                alt={`Logo for ${app.name}`}
                draggable={false}
                // Specify the size to avoid Cumulative Layout Shift:
                width="25"
                height="25"
                />
            </picture>
        </div>
        <h3 className={styles.appName}>{app.name}</h3>
      </div>
    </li>
  );
};

export default CategoryApp;
