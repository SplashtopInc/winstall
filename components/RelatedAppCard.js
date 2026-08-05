import { useState, useContext, useEffect } from "react";
import Link from "next/link";
import { FiPlus } from "react-icons/fi";
import styles from "../styles/appDetail.module.scss";
import SelectedContext from "../ctx/SelectedContext";
import AppIcon from "./AppIcon";
import { ensureAppBasics, isAppBasicsIncomplete } from "../utils/ensureAppBasics";

const RelatedAppCard = ({ app }) => {
  const [selected, setSelected] = useState(false);
  const { selectedApps, setSelectedApps } = useContext(SelectedContext);

  useEffect(() => {
    const found = selectedApps.findIndex((a) => a._id === app._id) !== -1;
    setSelected(found);
  }, [selectedApps, app._id]);

  const handleAppSelect = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const found = selectedApps.findIndex((a) => a._id === app._id);
    if (found !== -1) {
      setSelectedApps(selectedApps.filter((_, index) => index !== found));
      setSelected(false);
      return;
    }

    setSelected(true);
    const appToSelect = isAppBasicsIncomplete(app)
      ? await ensureAppBasics(app)
      : app;
    setSelectedApps([...selectedApps, appToSelect]);
  };

  if (!app || !app.name) return null;

  return (
    <article
      className={`${styles.relCard} ${selected ? styles.relCardOn : ""}`}
    >
      <div className={styles.relTop}>
        <Link
          href="/apps/[id]"
          as={`/apps/${app._id}`}
          prefetch={false}
          className={styles.relIcon}
          aria-label={app.name}
        >
          <AppIcon
            id={app._id}
            name={app.name}
            icon={app.icon}
            iconUrl={app.iconUrl}
            iconPng={app.iconPng}
          />
        </Link>
        <button
          type="button"
          className={`${styles.relAdd} ${selected ? styles.relAddOn : ""}`}
          onClick={handleAppSelect}
          aria-pressed={selected}
          aria-label={selected ? `Remove ${app.name}` : `Add ${app.name}`}
        >
          <FiPlus aria-hidden="true" />
        </button>
      </div>
      <Link
        href="/apps/[id]"
        as={`/apps/${app._id}`}
        prefetch={false}
        className={styles.relLink}
      >
        <div className={styles.relName}>{app.name}</div>
        {app.publisher && <div className={styles.relPub}>{app.publisher}</div>}
      </Link>
    </article>
  );
};

export default RelatedAppCard;
