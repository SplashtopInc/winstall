import styles from "../styles/shelfListSkeleton.module.scss";

const DEFAULT_COUNT = 8;

function AppSilhouette() {
  return (
    <div className={`${styles.card} ${styles.app}`}>
      <span className={styles.appAvatar} />
      <div className={styles.appText}>
        <span className={`${styles.bar} ${styles.barTitle}`} />
        <span className={`${styles.bar} ${styles.barSub}`} />
      </div>
    </div>
  );
}

function PackSilhouette() {
  return (
    <div className={`${styles.card} ${styles.pack}`}>
      <div className={styles.packIdentity}>
        <span className={styles.packAvatar} />
        <div className={styles.packText}>
          <span className={`${styles.bar} ${styles.barTitle}`} />
          <span className={`${styles.bar} ${styles.barSub}`} />
        </div>
      </div>
      <span className={`${styles.bar} ${styles.barDesc}`} />
    </div>
  );
}

export default function ShelfListSkeleton({
  variant = "app",
  count = DEFAULT_COUNT,
  gridClassName = "",
  label = "Loading",
}) {
  const Silhouette = variant === "pack" ? PackSilhouette : AppSilhouette;

  return (
    <ul
      className={gridClassName}
      aria-busy="true"
      aria-label={label}
    >
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <Silhouette />
        </li>
      ))}
    </ul>
  );
}
