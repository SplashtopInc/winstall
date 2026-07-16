import React, { useState, useContext, useEffect } from "react";
import styles from "../styles/prettyApp.module.scss";
import SelectedContext from "../ctx/SelectedContext";
import Link from "next/link";
import { FiCheck } from "react-icons/fi";
import { ensureAppBasics, isAppBasicsIncomplete } from "../utils/ensureAppBasics";

let PrettyApp = ({ app }) => {
  const [selected, setSelected] = useState(false);
  const { selectedApps, setSelectedApps } = useContext(SelectedContext);

  useEffect(() => {
    let found = selectedApps.findIndex((a) => a._id === app._id) !== -1;

    setSelected(found);
  }, [selectedApps, app._id]);

  let handleAppSelect = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    let found = selectedApps.findIndex((a) => a._id === app._id);
    if (found !== -1) {
      let updatedSelectedApps = selectedApps.filter(
        (a, index) => index !== found
      );

      setSelectedApps(updatedSelectedApps);
      setSelected(false);
    } else {
      setSelected(true);
      const appToSelect = isAppBasicsIncomplete(app)
        ? await ensureAppBasics(app)
        : app;
      setSelectedApps([...selectedApps, appToSelect]);
    }
  };

  if (!app || !app.img) return <></>;

  return (
    <li
      key={app._id}
      className={`${styles.app} ${selected ? styles.selected : ""}`}
    >
      <button
        type="button"
        className={`${styles.checkbox} ${selected ? styles.checkboxSelected : ""}`}
        onClick={handleAppSelect}
        aria-pressed={selected}
        aria-label={selected ? `Deselect ${app.name}` : `Select ${app.name}`}
      >
        {selected && <FiCheck aria-hidden="true" />}
      </button>

      <Link href="/apps/[id]" as={`/apps/${app._id}`} prefetch={false}>
        <div>
          <div className={styles.imgContainer}>
            <picture>
              <source
                srcSet={`/assets/apps/${app.img}`}
                type="image/webp"
              />
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
                width="80"
                height="80"
              />
            </picture>
          </div>
          <h3 className={styles.imgHeader}>{app.name}</h3>
        </div>
      </Link>
    </li>
  );
};

export default PrettyApp;
