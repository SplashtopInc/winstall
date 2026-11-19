import styles from "../styles/compareDetail.module.scss";

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function DashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

const ICONS = {
  positive: CheckIcon,
  negative: CrossIcon,
  neutral: DashIcon,
};

export default function CompareStatusCell({ text, tone = "positive" }) {
  const Icon = ICONS[tone] || CheckIcon;

  return (
    <div className={styles.statusCell}>
      <span className={`${styles.statusIcon} ${styles[tone] || styles.positive}`}>
        <Icon />
      </span>
      <span className={styles.statusText}>{text}</span>
    </div>
  );
}
