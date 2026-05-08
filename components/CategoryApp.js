import React, { useState, useContext, useEffect } from "react";
import styles from "../styles/categoryApp.module.scss";
import SelectedContext from "../ctx/SelectedContext";
import Link from "next/link";

let CategoryApp = ({ app }) => {
  const [selected, setSelected] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { selectedApps, setSelectedApps } = useContext(SelectedContext);

  useEffect(() => {
    let found = selectedApps.findIndex((a) => a._id === app._id) !== -1;

    setSelected(found);
  }, [selectedApps, app._id]);

  let handleAppSelect = () => {
    let found = selectedApps.findIndex((a) => a._id === app._id);
    if (found !== -1) {
      let updatedSelectedApps = selectedApps.filter(
        (a, index) => index !== found
      );

      setSelectedApps(updatedSelectedApps);
      setSelected(false);
    } else {
      setSelected(true);
      setSelectedApps([...selectedApps, app]);
    }
  };

  if (!app) return <></>;

  const AppIconElement = () => {
    if (!app.img || imgError) {
      return (
        <img
          src="/generic-app-icon.svg"
          alt="Package icon"
          draggable={false}
          width="25"
          height="25"
        />
      );
    }

    return (
      <picture>
        <source srcSet={`/assets/apps/${app.img}`} type="image/webp" />
        <source
          srcSet={`/assets/apps/fallback/${app.img.replace("webp", "png")}`}
          type="image/png"
        />
        <img
          src={`/assets/apps/fallback/${app.img.replace("webp", "png")}`}
          alt={`Logo for ${app.name}`}
          draggable={false}
          width="25"
          height="25"
          onError={() => setImgError(true)}
        />
      </picture>
    );
  };

  return (
    <li
      key={app._id}
      className={`${styles.app} ${selected ? styles.selected : ""}`}>
      <Link href="/apps/[id]" as={`/apps/${app._id}`} prefetch={false}>
        <div className={styles.appContent}>
          <div className={styles.iconContainer}>
            <AppIconElement />
          </div>
          <h3 className={styles.appName}>{app.name}</h3>
        </div>
      </Link>
    </li>
  );
};

export default CategoryApp;
