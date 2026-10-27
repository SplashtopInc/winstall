import { useState, useEffect, useRef } from "react";
import { FiMoreVertical, FiLogOut, FiTrash2 } from "react-icons/fi";
import styles from "../styles/userMenu.module.scss";

export default function UserMenu({
  user,
  onLogout,
  onDeleteAccount,
  variant = "default",
  open: controlledOpen,
  onClose,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const menuRef = useRef(null);
  const isNav = variant === "nav";
  const open = isNav ? controlledOpen : internalOpen;

  const closeMenu = () => {
    if (isNav) {
      onClose?.();
    } else {
      setInternalOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, isNav, onClose]);

  const handleLogout = () => {
    closeMenu();
    onLogout?.();
  };

  const handleDeleteAccount = () => {
    closeMenu();
    onDeleteAccount?.();
  };

  const dropdown = (
    <div className={`${styles.dropdown} ${isNav ? styles.navDropdown : ""}`}>
      <button
        type="button"
        className={styles.menuItem}
        onClick={handleLogout}
      >
        <FiLogOut />
        Log out
      </button>
      <div className={styles.divider} />
      <button
        type="button"
        className={`${styles.menuItem} ${styles.menuItemDanger}`}
        onClick={handleDeleteAccount}
      >
        <FiTrash2 />
        Delete account
      </button>
    </div>
  );

  if (isNav) {
    if (!open) return null;

    return (
      <div className={styles.navMenuWrapper} ref={menuRef}>
        {dropdown}
      </div>
    );
  }

  return (
    <div className={styles.userRow}>
      <div className={styles.userPill}>
        {user.image && (
          <img src={user.image} alt="" referrerPolicy="no-referrer" />
        )}
        <span>{user.name || user.email || "User"}</span>
      </div>
      <div className={styles.menuWrapper} ref={menuRef}>
        <button
          type="button"
          className={styles.menuButton}
          aria-label="User menu"
          aria-expanded={open}
          onClick={() => setInternalOpen((current) => !current)}
        >
          <FiMoreVertical />
        </button>
        {open && dropdown}
      </div>
    </div>
  );
}
