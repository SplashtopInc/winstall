import { FiDownload, FiEye, FiThumbsUp } from "react-icons/fi";

import { formatCount } from "../utils/engagementStats";
import styles from "../styles/trendingCounts.module.scss";

function countItemClass(raw) {
  return Number(raw) > 0 ? styles.stat : `${styles.stat} ${styles.statZero}`;
}

export default function TrendingCounts({ counts, className = "" }) {
  if (!counts) return null;

  const likes = formatCount(counts.likes) ?? "0";
  const downloads = formatCount(counts.downloads) ?? "0";
  const views = formatCount(counts.views) ?? "0";

  return (
    <ul
      className={`${styles.counts} ${className}`.trim()}
      aria-label="This week's views, downloads, and likes"
    >
      <li className={countItemClass(counts.views)}>
        <FiEye aria-hidden="true" />
        <span>{views}</span>
        <span className={styles.hidden}>views</span>
      </li>
      <li className={countItemClass(counts.downloads)}>
        <FiDownload aria-hidden="true" />
        <span>{downloads}</span>
        <span className={styles.hidden}>downloads</span>
      </li>
      <li className={countItemClass(counts.likes)}>
        <FiThumbsUp aria-hidden="true" />
        <span>{likes}</span>
        <span className={styles.hidden}>likes</span>
      </li>
    </ul>
  );
}
