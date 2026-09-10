import Link from "next/link";
import {
  FiCode,
  FiFileText,
  FiGlobe,
  FiMessageCircle,
  FiTool,
} from "react-icons/fi";

import { CATEGORY_LABELS, TOP_CATEGORY_SLUGS } from "../utils/categoryMeta";
import styles from "../styles/topCategories.module.scss";

const TOP_CATEGORY_ICONS = {
  browser: FiGlobe,
  development: FiCode,
  documents: FiFileText,
  communication: FiMessageCircle,
  utilities: FiTool,
};

const TOP_CATEGORY_TONES = {
  browser: styles.toneBrowser,
  development: styles.toneDevelopment,
  documents: styles.toneDocuments,
  communication: styles.toneCommunication,
  utilities: styles.toneUtilities,
};

export default function TopCategories() {
  return (
    <section className="homeBlock">
      <div className="box">
        <h2 className="blockHeader">Top Categories</h2>
      </div>
      <div className={styles.row}>
        {TOP_CATEGORY_SLUGS.map((slug) => {
          const Icon = TOP_CATEGORY_ICONS[slug];
          const label = CATEGORY_LABELS[slug] || slug;

          return (
            <Link
              key={slug}
              href={{ pathname: "/category", query: { category: slug } }}
              className={`${styles.card} ${TOP_CATEGORY_TONES[slug] || ""}`}
            >
              <span className={styles.icon} aria-hidden="true">
                {Icon ? <Icon /> : null}
              </span>
              <span className={styles.label}>{label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
