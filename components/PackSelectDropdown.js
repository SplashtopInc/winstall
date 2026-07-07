import { useEffect, useRef } from "react";
import { FiPlus } from "react-icons/fi";
import styles from "../styles/packSelectDropdown.module.scss";

export default function PackSelectDropdown({
  isOpen,
  onClose,
  packs = [],
  loading = false,
  adding = false,
  error = "",
  onSelectPack,
  onCreateNew,
  anchorRef,
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (anchorRef?.current?.contains(event.target)) return;
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const disabled = adding;

  return (
    <div className={styles.menu} ref={menuRef} role="menu">
      <button
        type="button"
        className={styles.createItem}
        onClick={onCreateNew}
        disabled={disabled}
        role="menuitem"
      >
        <FiPlus aria-hidden="true" className={styles.createIcon} />
        Create New Pack
      </button>

      <div className={styles.divider} />

      {loading ? (
        <p className={styles.loading}>Loading packs...</p>
      ) : packs.length === 0 ? (
        <p className={styles.empty}>No packs yet</p>
      ) : (
        <ul className={styles.list}>
          {packs.map((pack) => (
            <li key={pack._id}>
              <button
                type="button"
                className={styles.packItem}
                onClick={() => onSelectPack(pack)}
                disabled={disabled}
                role="menuitem"
              >
                {pack.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
