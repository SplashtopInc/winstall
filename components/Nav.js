import React, { useEffect, useState, useRef } from "react";
import Router, { useRouter } from "next/router";

import { useSession, signOut } from "next-auth/react";

import Link from "next/link";
import styles from "../styles/nav.module.scss";
import {
  FiMoon,
  FiSun,
  FiPackage,
  FiChevronDown,
  FiX,
  FiUser,
  FiSearch,
} from "react-icons/fi";

import UserMenu from "./UserMenu";
import DeleteAccountModal from "./DeleteAccountModal";
import { useAuthGate } from "../ctx/AuthGateContext";
import { useSearchDialog } from "../ctx/SearchDialogContext";
import { deleteAccount } from "../utils/fetchUserAPI";
import { invalidateOwnPacksCache } from "../utils/packHelpers";

import NProgress from "nprogress";

Router.onRouteChangeStart = () => {
  NProgress.start();
};

Router.onRouteChangeComplete = () => {
  NProgress.done();
};

Router.onRouteChangeError = () => {
  NProgress.done();
};

function Nav() {
  const [ddShown, setDDShown] = useState(false);
  const { openSearch } = useSearchDialog();
  const navRef = useRef(null);
  const router = useRouter();
  const pathname = router.pathname;

  let handleClickOut = (e) => {
    if (navRef.current && !navRef.current.contains(e.target)) {
      setDDShown(false);
      navRef.current.classList.remove("shown");
    }

    if (navRef.current && navRef.current.contains(e.target)) {
      setDDShown(false);
      setTimeout(() => {
        navRef.current.classList.remove("shown");
      }, 200);
    }
  };

  useEffect(() => {
    window.addEventListener("mousedown", handleClickOut);

    // cleanup this component
    return () => {
      window.removeEventListener("mousedown", handleClickOut);
    };
  }, []);

  let switchTheme = () => {
    let body = document.querySelector("body");

    if (body.classList.contains("light")) {
      localStorage.setItem("wiTheme", "dark");
      body.classList.replace("light", "dark");
    } else {
      localStorage.setItem("wiTheme", "light");
      body.classList.replace("dark", "light");
    }
  };

  const toggleDD = () => {
    if (ddShown) {
      navRef.current.classList.remove("shown");
    } else {
      navRef.current.classList.add("shown");
    }

    setDDShown(!ddShown);
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <img
            src="/assets/winstall_logo.svg"
            alt="winstall"
            className={`${styles.brandLogo} ${styles.brandLogoLight}`}
            draggable={false}
          />
          <img
            src="/assets/winstall logo_dark.svg"
            alt="winstall"
            className={`${styles.brandLogo} ${styles.brandLogoDark}`}
            draggable={false}
          />
        </Link>

        <div className={styles.nav}>
          <Link
            href="/"
            className={`${styles.mainLink} ${
              pathname === "/" || pathname === "" ? styles.selected : ""
            }`}
          >
            Discover App
          </Link>
          <Link
            href="/express"
            className={`${styles.mainLink} ${
              pathname === "/express" ? styles.selected : ""
            }`}
          >
            Express Setup
            <span className={styles.badge}>New</span>
          </Link>
          <Link
            href="/packs"
            className={`${styles.mainLink} ${
              pathname.startsWith("/packs") ? styles.selected : ""
            }`}
          >
            App Packs
            <span className={styles.badge}>New</span>
          </Link>
        </div>

        <div className={styles.profile} ref={navRef}>
          <button
            type="button"
            className={styles.searchTrigger}
            aria-label="Search apps"
            onClick={openSearch}
          >
            <FiSearch size={15} strokeWidth={2.5} />
            <span className={styles.searchTriggerText}>Search apps...</span>
          </button>
          <Link href="/apps" className={styles.navBtn}>
            <FiPackage size={16} />
            <span>Apps</span>
          </Link>
          <span
            onClick={switchTheme}
            className={`${styles.navBtn} ${styles.navBtnIcon}`}
            role="button"
            aria-label="Switch theme"
          >
            <FiMoon className="moon" size={18} />
            <FiSun className="sun" size={18} />
            <p className={styles.ddOnly}>Switch theme</p>
          </span>
          <NavUser />
        </div>

        <span
          className={`mobileDD ${styles.dropdown}`}
          onClick={toggleDD}
          role="button"
          aria-label="Menu"
        >
          {ddShown ? <FiX /> : <FiChevronDown />}
        </span>
      </div>
    </header>
  );
}

const NavUser = () => {
  const { data: session } = useSession();
  const { openLogin } = useAuthGate();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const isLoggedIn = Boolean(session);
  const avatarImage = session?.user?.image;

  const handleAvatarClick = () => {
    if (!session) {
      openLogin({ callbackUrl: router.asPath });
      return;
    }

    setMenuOpen((current) => !current);
  };

  const handleLogout = () => {
    invalidateOwnPacksCache();
    signOut({ callbackUrl: router.asPath });
  };

  const handleDeleteAccountConfirm = async () => {
    setDeletingAccount(true);

    const { error } = await deleteAccount();

    if (error) {
      setDeletingAccount(false);
      return { error };
    }

    invalidateOwnPacksCache();
    await signOut({ callbackUrl: router.asPath });
    return {};
  };

  return (
    <div className={styles.userMenuAnchor}>
      <span
        onClick={handleAvatarClick}
        className={`${styles.navBtn} ${styles.navBtnIcon} ${
          isLoggedIn ? styles.userAvatar : styles.userAvatarLoggedOut
        }`}
        role="button"
        aria-label={
          isLoggedIn
            ? session.user?.name || session.user?.email || "User menu"
            : "Log in"
        }
        aria-expanded={isLoggedIn ? menuOpen : undefined}
      >
        {!isLoggedIn ? (
          <FiUser size={18} />
        ) : avatarImage ? (
          <img src={avatarImage} alt="" referrerPolicy="no-referrer" />
        ) : (
          <span className={styles.defaultAvatar} aria-hidden="true">
            {getUserInitials(session.user)}
          </span>
        )}
        <p className={styles.ddOnly}>{isLoggedIn ? "Account" : "Log in"}</p>
      </span>
      {isLoggedIn && (
        <span className={styles.avatarTooltip} role="tooltip">
          {session.user?.name || session.user?.email || "User"}
        </span>
      )}
      {isLoggedIn && (
        <UserMenu
          variant="nav"
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          user={session.user}
          onLogout={handleLogout}
          onDeleteAccount={() => setShowDeleteAccountModal(true)}
        />
      )}
      <DeleteAccountModal
        isOpen={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        onConfirm={handleDeleteAccountConfirm}
        deleting={deletingAccount}
      />
    </div>
  );
};

function getUserInitials(user) {
  const name = user?.name?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  const email = user?.email?.trim();
  if (email) return email[0].toUpperCase();

  return "?";
}

export default Nav;
