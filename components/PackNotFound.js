import Link from "next/link";
import { FiGrid } from "react-icons/fi";

import styles from "../styles/packNotFound.module.scss";

function PackNotFound() {
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
        <h1 className={styles.emptyTitle}>This pack couldn&apos;t be found</h1>
        <p className={styles.emptyDesc}>
          The pack you&apos;re looking for may have been deleted by its creator,
          or it has been set to private and is no longer publicly accessible.
        </p>
        <Link href="/packs" className={`button accent ${styles.browseButton}`}>
          <FiGrid />
          Browse App Packs
        </Link>
      </div>
    </div>
  );
}

export default PackNotFound;
