import styles from "../styles/appNotFound.module.scss";
import TrySearching from "./TrySearching";

function AppNotFound({ packageId }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon} aria-hidden="true">
          <img
            src="/assets/app_not_found.svg"
            alt=""
            width={32}
            height={32}
            draggable={false}
          />
        </div>
        <h1 className={styles.emptyTitle}>This app couldn't be found</h1>
        {packageId ? <code className={styles.packageId}>{packageId}</code> : null}
        <p className={styles.emptyDesc}>
          The app may have been removed from the winget repository, or the package
          ID is incorrect. Try searching for a similar app below.
        </p>
      </div>

      {packageId ? (
        <TrySearching query={packageId} className={styles.suggestions} />
      ) : null}
    </div>
  );
}

export default AppNotFound;
