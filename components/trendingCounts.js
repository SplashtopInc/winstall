import { FiDownload, FiEye, FiHeart } from "react-icons/fi";

import { formatCount } from "../utils/engagementStats";
import styles from "../styles/trendingCounts.module.scss";

function countItemClass(raw) {
  return Number(raw) > 0 ? styles.stat : `${styles.stat} ${styles.statZero}`;
}

export default function TrendingCounts({
  counts,
  className = "",
  ariaLabel = "Views, downloads, and likes",
}) {
  if (!counts) return null;

  const likes = formatCount(counts.likeCount) ?? "0";
  const downloads = formatCount(counts.downloadCount) ?? "0";
  const views = formatCount(counts.viewCount) ?? "0";

  return (
    <ul
      className={`${styles.counts} ${className}`.trim()}
      aria-label={ariaLabel}
    >
      <li className={countItemClass(counts.viewCount)}>
        <FiEye aria-hidden="true" />
        <span>{views}</span>
        <span className={styles.hidden}>views</span>
      </li>
      <li className={countItemClass(counts.downloadCount)}>
        <FiDownload aria-hidden="true" />
        <span>{downloads}</span>
        <span className={styles.hidden}>downloads</span>
      </li>
      <li className={countItemClass(counts.likeCount)}>
        <FiHeart aria-hidden="true" />
        <span>{likes}</span>
        <span className={styles.hidden}>likes</span>
      </li>
    </ul>
  );
}
