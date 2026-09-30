import Link from "next/link";

import AppIcon from "./AppIcon";
import { normalizeTrendingPack } from "../utils/trendingData";
import styles from "../styles/trendingPacks.module.scss";

const PREVIEW_APP_LIMIT = 5;

function readPackAppTotal(pack) {
  const listed = Array.isArray(pack.apps) ? pack.apps.length : 0;
  const reported = [pack.appCount, pack.appsCount, pack.totalApps]
    .map((value) => Number(value))
    .find((value) => Number.isFinite(value) && value > listed);

  return reported || listed;
}

export default function TrendingPackCard({ pack }) {
  const normalized = normalizeTrendingPack(pack);
  const apps = Array.isArray(normalized.apps) ? normalized.apps : [];
  const previewApps = apps.slice(0, PREVIEW_APP_LIMIT);
  const overflowCount = Math.max(0, readPackAppTotal(normalized) - previewApps.length);

  return (
    <Link
      href={`/packs/${normalized._id}`}
      prefetch={false}
      className={styles.pack}
      aria-label={`View pack ${normalized.title}`}
    >
      <div className={styles.packInner}>
        <div className={styles.packHead}>
          <h3 className={styles.packTitle} title={normalized.title}>
            {normalized.title}
          </h3>
          <p className={styles.packDesc} title={normalized.desc || undefined}>
            {normalized.desc || "\u00a0"}
          </p>
        </div>

        <div className={styles.packApps}>
          {Array.from({ length: PREVIEW_APP_LIMIT }, (_, index) => {
            const app = previewApps[index];
            if (!app) {
              return (
                <div
                  className={styles.packApp}
                  key={`slot-${index}`}
                  aria-hidden="true"
                />
              );
            }

            return (
              <div className={styles.packApp} key={app._id || `${app.name}-${index}`}>
                <span className={styles.appMark}>
                  <AppIcon
                    id={app._id}
                    name={app.name}
                    icon={app.icon}
                    iconUrl={app.iconUrl}
                    iconPng={app.iconPng}
                  />
                </span>
                <span className={styles.appName} title={app.name}>
                  {app.name}
                </span>
              </div>
            );
          })}
          <div
            className={
              overflowCount > 0
                ? styles.packMore
                : `${styles.packMore} ${styles.packMoreReserve}`
            }
            aria-hidden={overflowCount > 0 ? undefined : true}
          >
            {overflowCount > 0 ? `+${overflowCount} more` : "+0 more"}
          </div>
        </div>
      </div>
    </Link>
  );
}
