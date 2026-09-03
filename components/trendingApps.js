import { useContext } from "react";
import Link from "next/link";
import { FiCheck } from "react-icons/fi";

import AppIcon from "./AppIcon";
import TrendingCounts from "./trendingCounts";
import SelectedContext from "../ctx/SelectedContext";
import { readTrendingCounts } from "../utils/trendingData";
import styles from "../styles/trendingApps.module.scss";
import countStyles from "../styles/trendingCounts.module.scss";

export default function TrendingApps({ apps = [] }) {
  const { selectedApps, setSelectedApps } = useContext(SelectedContext);

  if (!Array.isArray(apps) || apps.length === 0) return null;

  const rankedApps = [...apps]
    .sort((first, second) => Number(first.rank) - Number(second.rank))
    .slice(0, 20);

  const toggleApp = (app) => {
    const isSelected = selectedApps.some((item) => item._id === app._id);

    if (isSelected) {
      setSelectedApps(selectedApps.filter((item) => item._id !== app._id));
      return;
    }

    setSelectedApps([
      ...selectedApps,
      {
        ...app,
        selectedVersion: app.selectedVersion || app.latestVersion,
      },
    ]);
  };

  return (
    <section className="homeBlock">
      <div className="box">
        <h2 className="blockHeader">Trending Apps</h2>
      </div>
      <h3 className="blockSubtitle">Popular downloads this week.</h3>
      <ol className={styles.list}>
        {rankedApps.map((app) => {
          const rank = Number(app.rank) || 0;
          const isSelected = selectedApps.some(
            (item) => item._id === app._id
          );

          return (
            <li
              className={`${styles.card} ${
                isSelected ? styles.selected : ""
              } ${rank > 0 && rank <= 3 ? styles.rankTop : ""}`}
              key={app._id}
            >
              <button
                type="button"
                className={`${styles.checkbox} ${
                  isSelected ? styles.checkboxSelected : ""
                }`}
                onClick={() => toggleApp(app)}
                aria-pressed={isSelected}
                aria-label={
                  isSelected ? `Deselect ${app.name}` : `Select ${app.name}`
                }
              >
                {isSelected ? <FiCheck aria-hidden="true" /> : null}
              </button>

              <div className={styles.top}>
                <span className={styles.rank} aria-label={`Rank ${rank}`}>
                  #{rank}
                </span>
              </div>

              <Link
                href={`/apps/${encodeURIComponent(app._id)}`}
                prefetch={false}
                className={styles.identity}
              >
                <span className={styles.icon}>
                  <AppIcon
                    id={app._id}
                    name={app.name}
                    icon={app.icon}
                    iconUrl={app.iconUrl}
                    iconPng={app.iconPng}
                  />
                </span>
                <div className={styles.copy}>
                  <strong>{app.name}</strong>
                  {app.publisher && <small>{app.publisher}</small>}
                </div>
              </Link>

              <TrendingCounts
                counts={readTrendingCounts(app)}
                className={countStyles.inline}
              />
            </li>
          );
        })}
      </ol>
    </section>
  );
}
