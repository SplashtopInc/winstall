import Link from "next/link";
import { FiPackage } from "react-icons/fi";

import { appDetailPackCountLabel } from "../utils/appDetailPacks";
import styles from "../styles/appDetailPacks.module.scss";

export default function AppDetailPackCard({ pack }) {
  const name = typeof pack?.name === "string" ? pack.name : "";
  const description =
    typeof pack?.description === "string" ? pack.description.trim() : "";

  return (
    <Link
      href={`/packs/${encodeURIComponent(pack._id)}`}
      prefetch={false}
      className={styles.card}
      aria-label={`View pack ${name}`}
    >
      <div className={styles.identity}>
        <span className={styles.avatar} aria-hidden="true">
          <FiPackage />
        </span>
        <div className={styles.identityText}>
          <h3 className={styles.name} title={name}>
            {name}
          </h3>
          <p className={styles.count}>{appDetailPackCountLabel(pack.appCount)}</p>
        </div>
      </div>
      <p className={styles.description} title={description || undefined}>
        {description || "\u00a0"}
      </p>
    </Link>
  );
}
