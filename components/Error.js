import Link from "next/link";
import { FiGrid, FiHome, FiRefreshCw } from "react-icons/fi";

import styles from "../styles/error.module.scss";

const DEFAULT_TITLE = "Something went wrong";
const DEFAULT_DESCRIPTION =
  "We couldn't load this page right now. The service may be temporarily unavailable — try again in a moment, or head back home.";
const NOT_FOUND_TITLE = "This page couldn't be found";
const NOT_FOUND_DESCRIPTION =
  "The page you're looking for doesn't exist, or the link may be incorrect. Head home to keep browsing apps.";

function Error({
  title,
  subtitle,
  description,
  detail,
  primaryHref = "/",
  primaryLabel = "Go Home",
  primaryIcon = "home",
  showRetry = true,
  notFound = false,
}) {
  const resolvedDetail = detail ?? (!description && subtitle ? subtitle : null);
  const resolvedDescription =
    description ||
    (!resolvedDetail && subtitle ? subtitle : null) ||
    (notFound ? NOT_FOUND_DESCRIPTION : DEFAULT_DESCRIPTION);
  const resolvedTitle =
    !title || title === "Oops!"
      ? notFound
        ? NOT_FOUND_TITLE
        : DEFAULT_TITLE
      : title;
  const iconSrc = notFound
    ? "/assets/app_not_found.svg"
    : "/assets/error.svg";
  const PrimaryIcon = primaryIcon === "grid" ? FiGrid : FiHome;

  const handleRetry = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon} aria-hidden="true">
          <img
            src={iconSrc}
            alt=""
            width={32}
            height={32}
            draggable={false}
          />
        </div>
        <h1 className={styles.emptyTitle}>{resolvedTitle}</h1>
        {resolvedDetail ? (
          <code className={styles.detail}>{resolvedDetail}</code>
        ) : null}
        <p className={styles.emptyDesc}>{resolvedDescription}</p>
        <div className={styles.actions}>
          <Link
            href={primaryHref}
            className={`button accent ${styles.actionButton}`}
          >
            <PrimaryIcon />
            {primaryLabel}
          </Link>
          {showRetry ? (
            <button
              type="button"
              className={`button ${styles.actionButton}`}
              onClick={handleRetry}
            >
              <FiRefreshCw />
              Try again
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Error;
