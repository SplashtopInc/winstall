import Link from "next/link";
import { FiPackage } from "react-icons/fi";

import AppIcon from "./AppIcon";
import TrendingCounts from "./trendingCounts";
import {
  normalizeTrendingPack,
  readTrendingCounts,
} from "../utils/trendingData";
import styles from "../styles/trendingPacks.module.scss";
import countStyles from "../styles/trendingCounts.module.scss";

const PACK_GRADIENTS = [
  styles.gHome,
  styles.gGlobe,
  styles.gStar,
  styles.gMusic,
  styles.gGame,
  styles.gCode,
  styles.gSocial,
  styles.gSchool,
];

const PREVIEW_APP_LIMIT = 5;

export default function TrendingPackCard({ pack, index = 0 }) {
  const normalized = normalizeTrendingPack(pack);
  const rank = Number(normalized.rank) || index + 1;
  const gradientClass =
    PACK_GRADIENTS[(rank - 1) % PACK_GRADIENTS.length] || styles.gHome;
  const previewApps = Array.isArray(normalized.apps)
    ? normalized.apps.slice(0, PREVIEW_APP_LIMIT)
    : [];

  return (
    <Link
      href={`/packs/${normalized._id}`}
      prefetch={false}
      className={styles.pack}
      aria-label={`View pack ${normalized.title}`}
    >
      <div className={`${styles.packHead} ${gradientClass}`}>
        <span className={styles.packRank}>#{rank} this week</span>
        <FiPackage aria-hidden="true" className={styles.packIcon} />
        <h3>{normalized.title}</h3>
        {normalized.desc && <p>{normalized.desc}</p>}
        <TrendingCounts
          counts={readTrendingCounts(normalized)}
          className={countStyles.onHead}
        />
      </div>

      <div className={styles.packApps}>
        {previewApps.map((app) => (
          <div className={styles.packApp} key={app._id || app.name}>
            <span className={styles.appMark}>
              <AppIcon
                id={app._id}
                name={app.name}
                icon={app.icon}
                iconUrl={app.iconUrl}
                iconPng={app.iconPng}
              />
            </span>
            <span>{app.name}</span>
          </div>
        ))}
      </div>
    </Link>
  );
}
