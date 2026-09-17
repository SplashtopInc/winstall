import { FiCheck } from "react-icons/fi";
import AppIcon from "./AppIcon";
import AppListCounts from "./appListCounts";
import countStyles from "../styles/appListCounts.module.scss";
import styles from "../styles/addAppsDialog.module.scss";

export default function AddAppPickerCard({
  app,
  selected = false,
  alreadyAdded = false,
  onToggle,
}) {
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
      <div className={styles.pickerIdentityRow}>
        <div className={styles.pickerIdentity}>
          <span className={styles.pickerIcon}>
            <AppIcon
              id={app._id}
              name={app.name}
              icon={app.icon}
              iconUrl={app.iconUrl}
              iconPng={app.iconPng}
            />
          </span>
          <span className={styles.pickerIdentityText}>
            <strong>{app.name}</strong>
            {app.publisher ? <small>{app.publisher}</small> : null}
          </span>
        </div>
      </div>

      {app.desc ? <p className={styles.pickerCardDesc}>{app.desc}</p> : null}

      <AppListCounts
        app={app}
        className={`${countStyles.inline} ${styles.pickerCounts}`}
      />
    </div>
  );
}
