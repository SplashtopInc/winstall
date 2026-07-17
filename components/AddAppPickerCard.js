import { FiCheck, FiClock, FiPackage, FiThumbsUp, FiUser } from "react-icons/fi";
import AppIcon from "./AppIcon";
import { timeAgo } from "../utils/helpers";
import styles from "../styles/addAppsDialog.module.scss";

function formatLikeCount(count) {
  if (count == null || Number.isNaN(Number(count))) return null;
  const value = Number(count);
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(value);
}

export default function AddAppPickerCard({
  app,
  selected = false,
  alreadyAdded = false,
  onToggle,
}) {
  const version = app.latestVersion || app.appVersion;
  const likeLabel = formatLikeCount(app.likeCount ?? app.likes);

  const handleClick = () => {
    if (alreadyAdded) return;
    onToggle?.(app);
  };

  const handleKeyDown = (event) => {
    if (alreadyAdded) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onToggle?.(app);
    }
  };

  return (
    <div
      className={`${styles.pickerCard} ${selected ? styles.pickerCardSelected : ""} ${
        alreadyAdded ? styles.pickerCardAdded : ""
      }`}
      role="button"
      tabIndex={alreadyAdded ? -1 : 0}
      aria-pressed={selected}
      aria-disabled={alreadyAdded}
      title={app._id ? `${app._id}` : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {alreadyAdded && (
        <span className={styles.addedBadge}>
          <FiCheck aria-hidden="true" />
          Added
        </span>
      )}
      <div className={styles.pickerCardHeader}>
        <AppIcon
          id={app._id}
          name={app.name}
          icon={app.icon}
          iconUrl={app.iconUrl}
          iconPng={app.iconPng}
        />
        <h3 className={styles.pickerCardName}>{app.name}</h3>
      </div>

      {app.desc && <p className={styles.pickerCardDesc}>{app.desc}</p>}

      <ul className={styles.pickerCardMeta}>
        {app.updatedAt && (
          <li>
            <FiClock aria-hidden="true" />
            <span>Last updated {timeAgo(app.updatedAt)}</span>
          </li>
        )}
        {version && (
          <li>
            <FiPackage aria-hidden="true" />
            <span>v{version}</span>
          </li>
        )}
        {app.publisher && (
          <li>
            <FiUser aria-hidden="true" />
            <span>{app.publisher}</span>
          </li>
        )}
        {likeLabel && (
          <li>
            <FiThumbsUp aria-hidden="true" />
            <span>{likeLabel}</span>
          </li>
        )}
      </ul>
    </div>
  );
}
