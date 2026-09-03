import { FiDownload, FiEye, FiThumbsUp } from "react-icons/fi";

import { formatCount } from "../utils/engagementStats";
import styles from "../styles/trendingCounts.module.scss";

export default function TrendingCounts({ counts, className = "" }) {
  if (!counts) return null;

  const likes = formatCount(counts.likes) ?? "0";
  const downloads = formatCount(counts.downloads) ?? "0";
  const views = formatCount(counts.views) ?? "0";

  return (
    <ul
      className={`${styles.counts} ${className}`.trim()}
      aria-label="This week's likes, downloads, and views"
    >
      <li className={styles.stat}>
        <FiThumbsUp aria-hidden="true" />
        <span>{likes}</span>
        <span className={styles.hidden}>likes</span>
      </li>
      <li className={styles.stat}>
        <FiDownload aria-hidden="true" />
        <span>{downloads}</span>
        <span className={styles.hidden}>downloads</span>
      </li>
      <li className={styles.stat}>
        <FiEye aria-hidden="true" />
        <span>{views}</span>
        <span className={styles.hidden}>views</span>
      </li>
    </ul>
  );
}
