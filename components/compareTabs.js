import Link from "next/link";
import styles from "../styles/compareDetail.module.scss";

const TABS = [
  { label: "vs Ninite", page: "/compare-ninite" },
  { label: "vs Wingetly", page: "/compare-wingetly" },
  { label: "vs UniGetUI", page: "/compare-unigetui" },
  { label: "vs Chocolatey", page: "/compare-chocolatey" },
];

export default function CompareTabs({ active }) {
  return (
    <div className={styles.tabs}>
      {TABS.map((tab) => (
        <Link
          key={tab.page}
          href={tab.page}
          className={`${styles.tab} ${tab.page === active ? styles.active : ""}`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
