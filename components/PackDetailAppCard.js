import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FiClock,
  FiPackage,
  FiThumbsUp,
  FiMoreVertical,
  FiSettings,
  FiTrash2,
} from "react-icons/fi";
import AppIcon from "./AppIcon";
import { timeAgo } from "../utils/helpers";
import styles from "../styles/packDetail.module.scss";

function formatLikeCount(count) {
  if (count == null || Number.isNaN(Number(count))) return null;
  const value = Number(count);
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(value);
}

export default function PackDetailAppCard({
  app,
  isOwner = false,
  deleting = false,
  onConfig,
  onDelete,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const unavailable = Boolean(app.unavailable);
  const version = app.latestVersion || app.appVersion;
  const likeLabel = formatLikeCount(app.likeCount ?? app.likes);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const handleConfigClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuOpen(false);
    onConfig?.(app);
  };

  const handleDeleteClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuOpen(false);
    onDelete?.(app._id);
  };

  const handleMenuToggle = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuOpen((open) => !open);
  };

  const headerContent = (
    <>
      <AppIcon
        id={app._id}
        name={app.name}
        icon={app.icon}
        iconUrl={app.iconUrl}
        iconPng={app.iconPng}
      />
      <div className={styles.appNameGroup}>
        <h3 className={styles.appName}>{app.name}</h3>
        {unavailable && (
          <span className={styles.unavailableBadge}>Unavailable</span>
        )}
      </div>
    </>
  );

  const bodyContent = (
    <>
      {unavailable ? (
        <p className={styles.appUnavailableNote}>
          This app is no longer available in the catalog.
        </p>
      ) : (
        app.desc && <p className={styles.appDesc}>{app.desc}</p>
      )}

      <ul className={styles.appMeta}>
        {!unavailable && app.updatedAt && (
          <li>
            <FiClock aria-hidden="true" />
            <span>Last updated {timeAgo(app.updatedAt)}</span>
          </li>
        )}
        {version && (
          <li>
            <FiPackage aria-hidden="true" />
            <span>v{version}</span>
          </li>
        )}
        {!unavailable && likeLabel && (
          <li>
            <FiThumbsUp aria-hidden="true" />
            <span>{likeLabel}</span>
          </li>
        )}
      </ul>
    </>
  );

  return (
    <div
      className={`${styles.appCard}${unavailable ? ` ${styles.appCardUnavailable}` : ""}`}
    >
      <div className={styles.appHeader}>
        {unavailable ? (
          <div className={styles.appHeaderLink} aria-disabled="true">
            {headerContent}
          </div>
        ) : (
          <Link
            href={`/apps/${app._id}`}
            prefetch={false}
            className={styles.appHeaderLink}
          >
            {headerContent}
          </Link>
        )}

        {isOwner && (
          <div className={styles.appMenuWrapper} ref={menuRef}>
            <button
              type="button"
              className={styles.appMenu}
              aria-label={`Options for ${app.name}`}
              aria-expanded={menuOpen}
              onClick={handleMenuToggle}
            >
              <FiMoreVertical aria-hidden="true" />
            </button>
            {menuOpen && (
              <div className={styles.appMenuDropdown}>
                <button
                  type="button"
                  className={styles.appMenuItem}
                  onClick={handleConfigClick}
                >
                  <FiSettings aria-hidden="true" /> Config
                </button>
                <button
                  type="button"
                  className={styles.appMenuItem}
                  disabled={deleting}
                  onClick={handleDeleteClick}
                >
                  <FiTrash2 aria-hidden="true" />{" "}
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {unavailable ? (
        <div className={styles.appCardBody}>{bodyContent}</div>
      ) : (
        <Link
          href={`/apps/${app._id}`}
          prefetch={false}
          className={styles.appCardBodyLink}
        >
          {bodyContent}
        </Link>
      )}
    </div>
  );
}
