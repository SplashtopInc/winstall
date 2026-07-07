import { useEffect, useState } from "react";
import { FaFacebook, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { IoIosLink } from "react-icons/io";

import { fetchMyPacks, updatePack } from "../utils/fetchPackAPI";
import {
  countPublicPacksInList,
  MAX_PUBLIC_PACKS_PER_USER,
  PUBLIC_PACK_LIMIT_MESSAGE,
} from "../utils/packLimits";
import { buildSiteUrl } from "../utils/helpers";
import { syncOwnPacksCacheEntry } from "../utils/packHelpers";

import styles from "../styles/packDetail.module.scss";

export default function PackShareCard({
  pack,
  shareCardRef,
  user,
  onMadePublic,
}) {
  const [copyStatus, setCopyStatus] = useState("idle");
  const [agreeToPublic, setAgreeToPublic] = useState(false);
  const [makingPublic, setMakingPublic] = useState(false);
  const [makePublicError, setMakePublicError] = useState("");
  const [publicPackCount, setPublicPackCount] = useState(0);
  const [isPublic, setIsPublic] = useState(pack.visibility === "public");

  const shareUrl = buildSiteUrl(`/packs/${pack._id}`);
  const isAlreadyPublic = pack.visibility === "public";
  const publicLimitReached =
    publicPackCount >= MAX_PUBLIC_PACKS_PER_USER && !isAlreadyPublic && !isPublic;
  const publicCheckboxDisabled = makingPublic || publicLimitReached;
  const shareDisabled = !isPublic;

  const checkboxIcon =
    makingPublic || publicLimitReached
      ? agreeToPublic
        ? "/assets/cb_check_disable.svg"
        : "/assets/cb_uncheck_disable.svg"
      : agreeToPublic
        ? "/assets/cb_check.svg"
        : "/assets/cb_uncheck.svg";

  useEffect(() => {
    setIsPublic(pack.visibility === "public");
    setAgreeToPublic(pack.visibility === "public");
    setMakePublicError("");
  }, [pack._id, pack.visibility]);

  useEffect(() => {
    if (!user) {
      setPublicPackCount(0);
      return;
    }

    let cancelled = false;

    fetchMyPacks().then(({ response }) => {
      if (cancelled) return;
      setPublicPackCount(countPublicPacksInList(response));
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleAgreeChange = async (event) => {
    const checked = event.target.checked;

    if (!checked || isPublic) {
      setAgreeToPublic(checked && isPublic);
      setMakePublicError("");
      return;
    }

    setAgreeToPublic(true);
    setMakingPublic(true);
    setMakePublicError("");

    const { response, error } = await updatePack(pack._id, {
      visibility: "public",
    });

    setMakingPublic(false);

    if (error) {
      setAgreeToPublic(false);
      setMakePublicError(error);
      return;
    }

    if (response) {
      setIsPublic(true);
      syncOwnPacksCacheEntry(response);
      onMadePublic?.(response);
    }
  };

  const handleCopyLink = async () => {
    if (shareDisabled) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }

    setTimeout(() => {
      setCopyStatus("idle");
    }, 5000);
  };

  const shareToTwitter = () => {
    if (shareDisabled) return;

    const text = `Install apps from "${pack.name}" instantly with winget.\nGet it on Winstall:\n${shareUrl}\n#winget #winstall`;
    const link = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(
      link,
      "_blank",
      "width=640,height=480,resizable=yes,scrollbars=yes,status=yes"
    );
  };

  const shareToFacebook = () => {
    if (shareDisabled) return;

    const quote = `Install apps from "${pack.name}" instantly with winget.\nGet it on Winstall:\n${shareUrl}`;
    const link = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(quote)}`;
    window.open(
      link,
      "_blank",
      "width=640,height=480,resizable=yes,scrollbars=yes,status=yes"
    );
  };

  const shareToLinkedIn = () => {
    if (shareDisabled) return;

    const link = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&mini=true`;
    window.open(
      link,
      "_blank",
      "width=640,height=480,resizable=yes,scrollbars=yes,status=yes"
    );
  };

  return (
    <div className={styles.shareCard} ref={shareCardRef}>
      {!isPublic && (
        <div className={styles.sharePublicNotice}>
          <label className={styles.shareCheckboxLabel}>
            <span className={styles.shareCheckbox}>
              <input
                type="checkbox"
                className={styles.shareCheckboxInput}
                checked={agreeToPublic}
                disabled={publicCheckboxDisabled}
                onChange={handleAgreeChange}
              />
              <img
                src={checkboxIcon}
                alt=""
                aria-hidden="true"
                className={styles.shareCheckboxIcon}
                width={17}
                height={17}
              />
            </span>
            <span>Make this pack public to share</span>
          </label>
          <p className={styles.sharePublicHint}>
            {publicLimitReached
              ? PUBLIC_PACK_LIMIT_MESSAGE
              : "Anyone with the link will be able to view this pack."}
          </p>
          {makePublicError && (
            <p className={styles.sharePublicError}>{makePublicError}</p>
          )}
          {makingPublic && (
            <p className={styles.sharePublicHint}>Updating visibility...</p>
          )}
          <div className={styles.shareDivider} />
        </div>
      )}

      <button
        type="button"
        onClick={shareToTwitter}
        className={styles.shareButton}
        disabled={shareDisabled}
      >
        <FaXTwitter size={24} />
        <span>X (Twitter)</span>
      </button>
      <button
        type="button"
        onClick={shareToFacebook}
        className={styles.shareButton}
        disabled={shareDisabled}
      >
        <FaFacebook size={24} color="#1877F2" />
        <span>Facebook</span>
      </button>
      <button
        type="button"
        onClick={shareToLinkedIn}
        className={styles.shareButton}
        disabled={shareDisabled}
      >
        <FaLinkedin size={24} color="#0A66C2" />
        <span>LinkedIn</span>
      </button>
      <div className={styles.shareDivider} />
      <button
        type="button"
        onClick={handleCopyLink}
        disabled={shareDisabled}
        className={`${styles.shareButton} ${copyStatus === "failed" ? styles.shareButtonFailed : ""}`}
      >
        <IoIosLink size={24} />
        <span>
          {copyStatus === "copied"
            ? "Link copied"
            : copyStatus === "failed"
              ? "Copy failed"
              : "Copy link"}
        </span>
      </button>
    </div>
  );
}
