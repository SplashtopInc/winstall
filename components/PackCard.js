import Link from "next/link";
import { FiClock } from "react-icons/fi";
import AppIcon from "./AppIcon";
import styles from "../styles/packsIndex.module.scss";

const MAX_VISIBLE_ICONS = 6;

function formatPackDate(isoDate) {
  if (!isoDate) return "—";
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PackCard({ pack, href }) {
  const apps = pack.apps || [];
  const visibleApps = apps.slice(0, MAX_VISIBLE_ICONS);
  const overflowCount = apps.length - visibleApps.length;
  const linkHref = href || `/packs/${pack._id}`;

  return (
    <Link href={linkHref} prefetch={false} className={styles.packCard}>
      <h3 className={styles.packTitle}>{pack.name}</h3>
      <p className={styles.packDescription}>{pack.description}</p>

      <div className={styles.iconRow}>
        {visibleApps.map((app) => (
          <span key={app._id} className={styles.iconWrap}>
            <AppIcon
              id={app._id}
              name={app.name}
              icon={app.icon}
              iconUrl={app.iconUrl}
              iconPng={app.iconPng}
            />
          </span>
        ))}
        {overflowCount > 0 && (
          <span className={styles.iconOverflow}>+{overflowCount}</span>
        )}
      </div>

      <div className={styles.packFooter}>
        <FiClock aria-hidden="true" />
        <span>Last updated {formatPackDate(pack.updatedAt)}</span>
      </div>
    </Link>
  );
}
