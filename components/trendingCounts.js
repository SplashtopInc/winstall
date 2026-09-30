import { FiDownload, FiEye, FiHeart } from "react-icons/fi";

import { formatCount } from "../utils/engagementStats";
import { isTrendingCountVisible } from "../utils/trendingCountVisibility";
import { isStatsDisplayEnabled } from "../utils/statsDisplay";
import styles from "../styles/trendingCounts.module.scss";

const COUNT_ITEMS = [
  { key: "viewCount", label: "views", Icon: FiEye },
  { key: "downloadCount", label: "downloads", Icon: FiDownload },
  { key: "likeCount", label: "likes", Icon: FiHeart },
];

export default function TrendingCounts({
  counts,
  className = "",
  ariaLabel = "Views, downloads, and likes",
}) {
  if (!isStatsDisplayEnabled() || !counts) return null;

  const visible = COUNT_ITEMS.filter((item) =>
    isTrendingCountVisible(counts[item.key])
  );
  if (visible.length === 0) return null;

  return (
    <ul
      className={`${styles.counts} ${className}`.trim()}
      aria-label={ariaLabel}
    >
      {visible.map(({ key, label, Icon }) => (
        <li className={styles.stat} key={key}>
          <Icon aria-hidden="true" />
          <span>{formatCount(counts[key])}</span>
          <span className={styles.hidden}>{label}</span>
        </li>
      ))}
    </ul>
  );
}
