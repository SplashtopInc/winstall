import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FiClock,
  FiPackage,
  FiMoreVertical,
  FiSettings,
  FiTrash2,
  FiChevronDown,
} from "react-icons/fi";
import AppIcon from "./AppIcon";
import { timeAgo } from "../utils/helpers";
import { resolvePackAppVersion } from "../utils/installVersion";
import styles from "../styles/packDetail.module.scss";

export default function PackDetailAppCard({
  app,
  isOwner = false,
  showActions,
  deleting = false,
  onConfig,
  onDelete,
  onVersionChange,
  allowUnpinnedVersion = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const unavailable = Boolean(app.unavailable);
  // API returns versions with tip first — do not re-sort.
  const versions = Array.isArray(app.versions) ? app.versions : [];

  const { displayVersion, pinnedVersion } = allowUnpinnedVersion
    ? resolvePackAppVersion(app)
    : {
        displayVersion:
          app.selectedVersion || app.appVersion || app.latestVersion || "",
        pinnedVersion: app.selectedVersion || app.appVersion || "",
      };

  const selectValue = allowUnpinnedVersion ? pinnedVersion || "" : displayVersion;
  const canManage = showActions ?? isOwner;
  const canSelectVersion =
    canManage &&
    !unavailable &&
    onVersionChange &&
    (allowUnpinnedVersion ? versions.length >= 1 : versions.length > 1);

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

  const handleVersionSelect = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onVersionChange?.(app, event.target.value);
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

  const versionContent = displayVersion ? (
    canSelectVersion ? (
      <div className={styles.appMetaVersion}>
        <span className={styles.versionLabel}>v{displayVersion}</span>
        <select
          className={styles.versionSelector}
          value={selectValue}
          onClick={(event) => event.stopPropagation()}
          onChange={handleVersionSelect}
          aria-label={`Select version for ${app.name}`}
        >
          {allowUnpinnedVersion && (
            <option value="">Latest</option>
          )}
          {versions.map((entry) => (
            <option key={entry.version} value={entry.version}>
              v{entry.version}
            </option>
          ))}
        </select>
        <FiChevronDown aria-hidden="true" />
      </div>
    ) : (
      <span>v{displayVersion}</span>
    )
  ) : null;

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
        {versionContent && (
          <li className={canSelectVersion ? styles.appMetaVersionRow : undefined}>
            <FiPackage aria-hidden="true" />
            {versionContent}
          </li>
        )}
      </ul>
    </>
  );

  const bodyWrapperClass = canSelectVersion
    ? styles.appCardBody
    : styles.appCardBodyLink;

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

        {canManage && (
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
      ) : canSelectVersion ? (
        <div className={bodyWrapperClass}>{bodyContent}</div>
      ) : (
        <Link href={`/apps/${app._id}`} prefetch={false} className={bodyWrapperClass}>
          {bodyContent}
        </Link>
      )}
    </div>
  );
}
