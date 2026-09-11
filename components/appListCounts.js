import { FiDownload, FiEye, FiThumbsUp } from "react-icons/fi";

import { formatCount } from "../utils/engagementStats";
import { readAppListCounts } from "../utils/appListCounts";
import styles from "../styles/appListCounts.module.scss";

export default function AppListCounts({ app, className = "" }) {
  const counts = readAppListCounts(app);
  const views = formatCount(counts.viewCount) ?? "0";
  const downloads = formatCount(counts.downloadCount) ?? "0";
  const likes = formatCount(counts.likeCount) ?? "0";

  return (
    <ul
      className={`${styles.counts} ${className}`.trim()}
      aria-label="Views, downloads, and likes"
    >
      <li className={styles.stat}>
        <FiEye aria-hidden="true" />
        <span>{views}</span>
        <span className={styles.hidden}>views</span>
      </li>
      <li className={styles.stat}>
        <FiDownload aria-hidden="true" />
        <span>{downloads}</span>
        <span className={styles.hidden}>downloads</span>
      </li>
      <li className={styles.stat}>
        <FiThumbsUp aria-hidden="true" />
        <span>{likes}</span>
        <span className={styles.hidden}>likes</span>
      </li>
    </ul>
  );
}
