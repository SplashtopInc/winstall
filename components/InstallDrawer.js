import ExportApps from "./AppExport/ExportApps";
import drawerStyles from "../styles/appSettingsDrawer.module.scss";
import styles from "../styles/installDrawer.module.scss";

export default function InstallDrawer({
  apps,
  isOpen,
  onClose,
  initialFilters,
  onDefaultFiltersChange,
  persistHint,
  packId,
}) {
  return (
    <>
      <div
        className={`${drawerStyles.overlay} ${isOpen ? drawerStyles.open : ""}`}
        onClick={onClose}
      />
      <div
        className={`${drawerStyles.drawer} ${isOpen ? drawerStyles.open : ""}`}
      >
        <div className={drawerStyles.header}>
          <button
            type="button"
            className={drawerStyles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 1L13 13M13 1L1 13"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <h2>Your apps are ready to be installed.</h2>
          <p className={styles.subtitle}>
            Make sure you have Windows Package Manager installed :)
          </p>
        </div>

        <div className={drawerStyles.content}>
          <ExportApps
            apps={apps || []}
            initialFilters={initialFilters}
            onDefaultFiltersChange={onDefaultFiltersChange}
            persistHint={persistHint}
            packId={packId}
          />
        </div>
      </div>
    </>
  );
}
