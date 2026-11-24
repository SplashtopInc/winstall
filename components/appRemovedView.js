import { useState } from "react";
import Link from "next/link";
import { FiGrid, FiSearch } from "react-icons/fi";

import styles from "../styles/appDetail.module.scss";
import AppIcon from "./AppIcon";
import LikeButton from "./LikeButton";
import useResourceEngagement from "../hooks/useResourceEngagement";
import { formatCount } from "../utils/engagementStats";
import { timeAgo } from "../utils/helpers";
import { formatRemovedOn } from "../utils/isAppRemoved";
import { isStatsDisplayEnabled } from "../utils/statsDisplay";
import { publisherAppsPagePath } from "../utils/parsePublisherQuery";
import {
  categoryBrowseLinkLabel,
  categoryPagePath,
  detailShelfSlugs,
} from "../utils/categoryShelfPath";

const TAG_PREVIEW_COUNT = 8;

export default function AppRemovedView({ app }) {
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const { stats, pending: likePending, onLikeClick } = useResourceEngagement({
    targetType: "app",
    targetId: app._id,
    callbackUrl: `/apps/${app._id}`,
  });

  const allTags = Array.isArray(app.tags) ? app.tags : [];
  const tagsOverflow = allTags.length > TAG_PREVIEW_COUNT;
  const visibleTags =
    tagsExpanded || !tagsOverflow ? allTags : allTags.slice(0, TAG_PREVIEW_COUNT);
  const hiddenTagCount = allTags.length - TAG_PREVIEW_COUNT;
  const removedOn = formatRemovedOn(app.deletedAt);
  const lastVersion = app.latestVersion || app.versions?.[0]?.version || "";
  const shelfSlugs = detailShelfSlugs(app.categories);
  const description = app.fullDesc || app.desc;

  return (
    <div className={styles.page}>
      <section className={styles.identity}>
        <div className={styles.icon}>
          <AppIcon
            id={app._id}
            name={app.name}
            icon={app.icon}
            iconUrl={app.iconUrl}
            iconPng={app.iconPng}
          />
        </div>
        <div className={styles.identityText}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{app.name}</h1>
            <span className={styles.removedPill}>Removed</span>
          </div>
          {app.publisher && (
            <p className={styles.publisher}>
              by{" "}
              <Link href={publisherAppsPagePath(app.publisher)}>
                {app.publisher}
              </Link>
            </p>
          )}
        </div>
      </section>

      {isStatsDisplayEnabled() && stats && (
        <p className={styles.counts}>
          {formatCount(stats.views)} views · {formatCount(stats.downloads)}{" "}
          installs
        </p>
      )}

      <section className={styles.notice} aria-labelledby="removed-heading">
        <h2 className={styles.noticeTitle} id="removed-heading">
          Removed from winget
        </h2>
        {removedOn ? <p className={styles.noticeDate}>{removedOn}</p> : null}
        <p className={styles.noticeText}>
          winget can no longer install {app.name}. This page keeps the last
          listing: the name, description, and last published version.
        </p>
        <Link
          href={{ pathname: "/apps", query: { q: app.name } }}
          className={`${styles.btn} ${styles.btnPrimary} ${styles.noticeBtn}`}
        >
          <FiSearch aria-hidden="true" />
          Search for {app.name}
        </Link>
      </section>

      <div className={styles.actions}>
        <LikeButton
          liked={Boolean(stats?.liked)}
          pending={likePending}
          onClick={onLikeClick}
          className={`${styles.likeBtn} ${stats?.liked ? styles.likeBtnOn : ""}`}
        />
      </div>

      <section className={styles.about}>
        <p className={styles.aboutText}>
          {description || "No description available for this app."}
        </p>
        {allTags.length > 0 && (
          <div className={styles.tags}>
            {visibleTags.map((tag) => (
              <Link
                key={tag}
                href={{ pathname: "/apps", query: { q: `tags: ${tag}` } }}
                className={styles.tag}
              >
                {tag}
              </Link>
            ))}
            {tagsOverflow && (
              <button
                type="button"
                className={styles.tagMore}
                onClick={() => setTagsExpanded((open) => !open)}
                aria-expanded={tagsExpanded}
              >
                {tagsExpanded ? "Show less" : `+${hiddenTagCount} more`}
              </button>
            )}
          </div>
        )}
      </section>

      <section className={styles.info} aria-label="Information">
        <h2 className={styles.infoTitle}>Information</h2>
        <div className={styles.infoGrid}>
          {app.publisher && (
            <div className={styles.infoItem}>
              <span className={styles.infoKey}>Publisher</span>
              <Link
                href={publisherAppsPagePath(app.publisher)}
                className={styles.infoValueLink}
              >
                {app.publisher}
              </Link>
            </div>
          )}
          {lastVersion && (
            <div className={styles.infoItem}>
              <span className={styles.infoKey}>Last version</span>
              <span className={styles.infoValue}>{lastVersion}</span>
            </div>
          )}
          {removedOn && (
            <div className={styles.infoItem}>
              <span className={styles.infoKey}>Removed</span>
              <span className={styles.infoValue}>{removedOn}</span>
            </div>
          )}
          {app.updatedAt && (
            <div className={styles.infoItem}>
              <span className={styles.infoKey}>Updated</span>
              <span className={styles.infoValue}>{timeAgo(app.updatedAt)}</span>
            </div>
          )}
          {app.license && (
            <div className={styles.infoItem}>
              <span className={styles.infoKey}>License</span>
              {app.licenseUrl ? (
                <a
                  href={app.licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer ugc"
                  className={styles.infoValueLink}
                >
                  {app.license}
                </a>
              ) : (
                <span className={styles.infoValue}>{app.license}</span>
              )}
            </div>
          )}
          <div className={styles.infoItem}>
            <span className={styles.infoKey}>Package ID</span>
            <span className={`${styles.infoValue} ${styles.mono}`}>{app._id}</span>
          </div>
        </div>

        {shelfSlugs.length > 0 && (
          <ul className={styles.infoLinks}>
            {shelfSlugs.map((slug) => (
              <li key={slug}>
                <Link href={categoryPagePath(slug)}>
                  <FiGrid aria-hidden="true" />
                  {categoryBrowseLinkLabel(slug)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
