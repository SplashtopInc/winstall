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
} from "react-icons/fi";

import UserMenu from "./UserMenu";
import DeleteAccountModal from "./DeleteAccountModal";
import { useAuthGate } from "../ctx/AuthGateContext";
import { deleteAccount } from "../utils/fetchUserAPI";

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
    <header>
      <div className={styles.leftSection}>
        <div className={styles.brand}>
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
        </div>

        <div className={styles.nav}>
          <Link
            href="/"
            className={`${styles.mainLink} ${(pathname === '/' || pathname === '') ? styles.selected : ''}`}
          >
            Discover App
          </Link>
          <span className={styles.linkWithTag}>
            <Link
              href="/express"
              className={`${styles.mainLink} ${pathname === '/express' ? styles.selected : ''}`}
            >
              Express Setup
            </Link>
            <img src="/tag_new.svg" alt="new" className={styles.newTag} />
          </span>
          <span className={styles.linkWithTag}>
            <Link
              href="/packs"
              className={`${styles.mainLink} ${pathname.startsWith('/packs') ? styles.selected : ''}`}
            >
              App Packs
            </Link>
            <img src="/tag_new.svg" alt="new" className={styles.newTag} />
          </span>
        </div>
      </div>

      <div className={styles.profile} ref={navRef}>
        <Link href="/apps">
          <FiPackage />
          <p>Apps</p>
        </Link>
        {/* <a
          href="https://ko-fi.com/mehedi"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.justIcon}
        >
          <FiHeart />
          <p className={styles.ddOnly}>Support winstall</p>
        </a> */}
        <span onClick={switchTheme} className={styles.justIcon}>
          <FiMoon className="moon" />
          <FiSun className="sun" />
          <p className={styles.ddOnly}>Switch theme</p>
        </span>
        <NavUser />
      </div>

      <span className={`mobileDD ${styles.dropdown}`} onClick={toggleDD}>
        {ddShown ? <FiX /> : <FiChevronDown />}
      </span>
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

  const handleAvatarClick = () => {
    if (!session) {
      openLogin({ callbackUrl: router.asPath });
      return;
    }

    setMenuOpen((current) => !current);
  };

  const handleLogout = () => {
    signOut({ callbackUrl: router.asPath });
  };

  const handleDeleteAccountConfirm = async () => {
    setDeletingAccount(true);

    const { error } = await deleteAccount();

    if (error) {
      setDeletingAccount(false);
      return { error };
    }

    localStorage.removeItem("ownPacks");
    await signOut({ callbackUrl: router.asPath });
    return {};
  };

  return (
    <div className={styles.userMenuAnchor}>
      <span
        onClick={handleAvatarClick}
        className={`${styles.justIcon} ${styles.userAvatar}`}
        role="button"
        aria-label={
          session
            ? session.user?.name || session.user?.email || "User menu"
            : "Log in"
        }
        aria-expanded={session ? menuOpen : undefined}
      >
        {session?.user?.image ? (
          <img src={session.user.image} alt="" referrerPolicy="no-referrer" />
        ) : (
          <FiUser />
        )}
        <p className={styles.ddOnly}>{session ? "Account" : "Log in"}</p>
      </span>
      {session && (
        <span className={styles.avatarTooltip} role="tooltip">
          {session.user?.name || session.user?.email || "User"}
        </span>
      )}
      {session && (
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

export default Nav;
