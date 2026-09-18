import Link from "next/link";
import { FiClock, FiPackage } from "react-icons/fi";
import AppIcon from "./AppIcon";
import AppListCounts from "./appListCounts";
import { timeAgo } from "../utils/helpers";
import styles from "../styles/packsIndex.module.scss";
import countStyles from "../styles/appListCounts.module.scss";

const MAX_VISIBLE_ICONS = 6;

function readPackAuthor(pack) {
  const sources = [pack?.creator, pack?.user, pack?.author];
  for (const source of sources) {
    if (!source) continue;
    if (typeof source === "string" && source.trim()) {
      return source.trim();
    }
    if (typeof source === "object") {
      const name =
        source.name ||
        source.displayName ||
        source.username ||
        source.login ||
        source.handle;
      if (typeof name === "string" && name.trim()) {
        return name.trim();
      }
    }
  }
  return null;
}

function readAppCount(pack) {
  if (typeof pack?.appCount === "number") return pack.appCount;
  return (pack?.apps || []).length;
}

export default function PackCard({ pack, href, showVisibility = true }) {
  const apps = pack.apps || [];
  const appCount = readAppCount(pack);
  const visibleApps = apps.slice(0, MAX_VISIBLE_ICONS);
  const overflowCount = Math.max(0, appCount - visibleApps.length);
  const linkHref = href || `/packs/${pack._id}`;
  const description =
    typeof pack.description === "string" ? pack.description.trim() : "";
  const author = readPackAuthor(pack);

  const visibility = pack.visibility || "private";
  const visibilityLabel =
    visibility.charAt(0).toUpperCase() + visibility.slice(1);

  const subtitleParts = [
    `${appCount} ${appCount === 1 ? "app" : "apps"}`,
    author,
  ].filter(Boolean);

  return (
    <Link href={linkHref} prefetch={false} className={styles.packCard}>
      <div className={styles.packIdentity}>
        <span className={styles.packAvatar} aria-hidden="true">
          <FiPackage />
        </span>
        <div className={styles.packIdentityText}>
          <div className={styles.packTitleRow}>
            <h3 className={styles.packTitle}>{pack.name}</h3>
            {showVisibility && (
              <span className={styles.visibilityBadge}>{visibilityLabel}</span>
            )}
          </div>
          <p className={styles.packSubtitle}>{subtitleParts.join(" · ")}</p>
        </div>
      </div>

      {description ? (
        <p className={styles.packDescription}>{description}</p>
      ) : null}

      {visibleApps.length > 0 && (
        <div className={styles.iconRow} aria-hidden="true">
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
      )}

      <div className={styles.packFooter}>
        <span className={styles.packUpdated}>
          <FiClock aria-hidden="true" />
          <span>{pack.updatedAt ? timeAgo(pack.updatedAt) : "—"}</span>
        </span>
        <AppListCounts
          app={pack}
          className={`${countStyles.inline} ${styles.packCounts}`}
          ariaLabel="Pack views, downloads, and likes"
        />
      </div>
    </Link>
  );
}
