import { useState, useContext, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { FiPlus, FiShare2, FiExternalLink, FiCode } from "react-icons/fi";
import { FaFacebook, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { IoIosLink } from "react-icons/io";

import styles from "../styles/appDetail.module.scss";
import SelectedContext from "../ctx/SelectedContext";
import AppIcon from "./AppIcon";
import DonateCard from "./DonateCard";
import Toast from "./Toast";
import { buildSiteUrl, compareVersion, timeAgo } from "../utils/helpers";

export default function AppDetailView({ app }) {
  const { selectedApps, setSelectedApps } = useContext(SelectedContext);

  const versions = useMemo(() => {
    if (!app.versions?.length) return [];
    return [...app.versions].sort((a, b) =>
      compareVersion(b.version, a.version)
    );
  }, [app.versions]);

  const latestVersion = versions[0]?.version || app.latestVersion;
  const [version, setVersion] = useState(latestVersion);
  const [selected, setSelected] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState("idle");
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const shareRef = useRef(null);

  const TAG_PREVIEW_COUNT = 8;
  const allTags = Array.isArray(app.tags) ? app.tags : [];
  const tagsOverflow = allTags.length > TAG_PREVIEW_COUNT;
  const visibleTags =
    tagsExpanded || !tagsOverflow
      ? allTags
      : allTags.slice(0, TAG_PREVIEW_COUNT);
  const hiddenTagCount = allTags.length - TAG_PREVIEW_COUNT;

  const shareUrl = buildSiteUrl(`/apps/${app._id}`);
  const shareText = `Install ${app.name} instantly with winget.\nGet it on Winstall:\n${shareUrl}\n#winget #winstall`;

  useEffect(() => {
    setTagsExpanded(false);
  }, [app._id]);

  useEffect(() => {
    setVersion(latestVersion);
  }, [app._id, latestVersion]);

  useEffect(() => {
    const found = selectedApps.find((a) => a._id === app._id);
    setSelected(!!found);
    if (found?.selectedVersion) {
      setVersion(found.selectedVersion);
    }
  }, [selectedApps, app._id]);

  useEffect(() => {
    if (!shareOpen) return;

    const onClick = (e) => {
      if (shareRef.current && !shareRef.current.contains(e.target)) {
        setShareOpen(false);
      }
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [shareOpen]);

  const handleVersionChange = (next) => {
    setVersion(next);

    if (selected) {
      setSelectedApps(
        selectedApps.map((a) =>
          a._id === app._id ? { ...a, selectedVersion: next } : a
        )
      );
    }
  };

  const handleSelect = () => {
    const found = selectedApps.findIndex((a) => a._id === app._id);

    if (found !== -1) {
      setSelectedApps(selectedApps.filter((_, i) => i !== found));
      setSelected(false);
      setToast(`Removed ${app.name}`);
    } else {
      setSelectedApps([
        ...selectedApps,
        { ...app, selectedVersion: version, latestVersion },
      ]);
      setSelected(true);
      setToast(`Added ${app.name}`);
    }
  };

  const handleCopy = async () => {
    const installCmd =
      version === latestVersion
        ? `winget install -e --id ${app._id}`
        : `winget install -e --id ${app._id} -v "${version}"`;

    try {
      await navigator.clipboard.writeText(installCmd);
      setCopied(true);
      setToast("Command copied");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setToast("Copy failed");
    }
  };

  const openShareWindow = (url) => {
    window.open(
      url,
      "_blank",
      "width=640,height=480,resizable=yes,scrollbars=yes,status=yes"
    );
  };

  const shareToTwitter = () => {
    setShareOpen(false);
    openShareWindow(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
    );
  };

  const shareToFacebook = () => {
    setShareOpen(false);
    openShareWindow(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}&quote=${encodeURIComponent(shareText)}`
    );
  };

  const shareToLinkedIn = () => {
    setShareOpen(false);
    openShareWindow(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        shareUrl
      )}&mini=true`
    );
  };

  const handleCopyLink = async () => {
    setShareOpen(false);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus("copied");
      setToast("Link copied");
    } catch {
      setCopyStatus("failed");
      setToast("Copy failed");
    }
    setTimeout(() => setCopyStatus("idle"), 2000);
  };

  const copyright = app.copyright || (app.publisher ? `© ${app.publisher}` : "");

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
          <h1 className={styles.title}>{app.name}</h1>
          {app.publisher && (
            <p className={styles.publisher}>
              by{" "}
              <Link href={`/apps?q=${`publisher: ${app.publisher}`}`}>
                {app.publisher}
              </Link>
            </p>
          )}
        </div>
      </section>

      <div className={styles.inst}>
        <div className={styles.instHead}>
          <p className={styles.instLabel}>Install with winget</p>
          {versions.length > 0 && (
            <div className={styles.verWrap}>
              <label className={styles.verLabel} htmlFor="app-version-select">
                Version
              </label>
              <select
                id="app-version-select"
                className={styles.verSel}
                value={version}
                aria-label="Select app version"
                onChange={(e) => handleVersionChange(e.target.value)}
              >
                {versions.map((v) => (
                  <option key={v.version} value={v.version}>
                    {v.version}
                    {v.version === latestVersion ? " (latest)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className={styles.cmd}>
          <div className={styles.cmdText}>
            <span>
              winget install -e --id{" "}
              <span className={styles.cmdId}>{app._id}</span>
              {version !== latestVersion && (
                <>
                  {" "}
                  -v <span className={styles.cmdId}>{`"${version}"`}</span>
                </>
              )}
            </span>
          </div>
          <button
            type="button"
            className={`${styles.cmdCopy} ${copied ? styles.cmdCopyOk : ""}`}
            onClick={handleCopy}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnPrimary} ${
            selected ? styles.btnPrimaryOn : ""
          }`}
          onClick={handleSelect}
        >
          <FiPlus className={styles.btnIcon} />
          {selected ? "Remove" : "Add to list"}
        </button>

        <div className={styles.shareWrap} ref={shareRef}>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={() => setShareOpen((v) => !v)}
            title="Share"
            aria-label="Share"
            aria-expanded={shareOpen}
            aria-haspopup="true"
          >
            <FiShare2 />
          </button>

          {shareOpen && (
            <div className={styles.shareMenu} role="menu">
              <button
                type="button"
                className={styles.shareItem}
                onClick={shareToTwitter}
                role="menuitem"
              >
                <FaXTwitter size={20} />
                <span>X (Twitter)</span>
              </button>
              <button
                type="button"
                className={styles.shareItem}
                onClick={shareToFacebook}
                role="menuitem"
              >
                <FaFacebook size={20} color="#1877F2" />
                <span>Facebook</span>
              </button>
              <button
                type="button"
                className={styles.shareItem}
                onClick={shareToLinkedIn}
                role="menuitem"
              >
                <FaLinkedin size={20} color="#0A66C2" />
                <span>LinkedIn</span>
              </button>
              <div className={styles.shareSep} />
              <button
                type="button"
                className={styles.shareItem}
                onClick={handleCopyLink}
                role="menuitem"
              >
                <IoIosLink size={20} />
                <span>
                  {copyStatus === "copied"
                    ? "Link copied"
                    : copyStatus === "failed"
                      ? "Copy failed"
                      : "Copy link"}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      <section className={styles.about}>
        <p className={styles.aboutText}>
          {app.fullDesc || app.desc || "No description available for this app."}
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
                onClick={() => setTagsExpanded((v) => !v)}
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
                href={`/apps?q=${`publisher: ${app.publisher}`}`}
                className={styles.infoValueLink}
              >
                {app.publisher}
              </Link>
            </div>
          )}

          {version && (
            <div className={styles.infoItem}>
              <span className={styles.infoKey}>Version</span>
              <span className={styles.infoValue}>{version}</span>
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
            <span className={`${styles.infoValue} ${styles.mono}`}>
              {app._id}
            </span>
          </div>

          {app.minOS && (
            <div className={styles.infoItem}>
              <span className={styles.infoKey}>Min. OS</span>
              <span className={styles.infoValue}>{app.minOS}</span>
            </div>
          )}

          {copyright && (
            <div className={styles.infoItem}>
              <span className={styles.infoKey}>Copyright</span>
              <span className={styles.infoValue}>{copyright}</span>
            </div>
          )}
        </div>

        <ul className={styles.infoLinks}>
          {app.homepage && (
            <li>
              <a
                href={`${app.homepage}?ref=winstall`}
                target="_blank"
                rel="noopener noreferrer ugc"
              >
                <FiExternalLink />
                View Site
              </a>
            </li>
          )}
          <li>
            <a
              href={`https://github.com/microsoft/winget-pkgs/tree/master/manifests/${app._id
                .substring(0, 1)
                .toLowerCase()}/${app._id.replaceAll(".", "/")}/`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiCode />
              Source code for winget package
            </a>
          </li>
        </ul>
      </section>

      <div className={styles.donateWrap}>
        <DonateCard addMargin="" placement="app-detail" />
      </div>

      <Toast message={toast} onDismiss={() => setToast("")} duration={2000} />
    </div>
  );
}
