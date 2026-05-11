import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Router from "next/router";

import { useSession, signIn, signOut, getSession } from "next-auth/react";

import Link from "next/link";
import styles from "../styles/nav.module.scss";
import {
  FiMoon,
  FiSun,
  FiPackage,
  FiTwitter,
  FiLogOut,
  FiGrid,
  FiChevronDown,
  FiX,
  FiZap,
} from "react-icons/fi";

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
            src="/assets/logo.svg"
            alt="winstall logo"
            width="48"
            height="48"
            draggable={false}
          />
          <span className={styles.brandText}>winstall</span>
          {/* <span className="preview">&nbsp;(preview)</span> */}
        </div>

        <div className={styles.nav}>
          <Link href="/" className={styles.mainLink}>
            Discover App
          </Link>
          <Link href="/express" className={styles.mainLink}>
            Express Setup
          </Link>
        </div>
      </div>

      <div className={styles.profile} ref={navRef}>
        {/* <Link href="/apps">
          <FiPackage />
          <p>Apps</p>
        </Link> */}
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
        <User />
      </div>

      <span className={`mobileDD ${styles.dropdown}`} onClick={toggleDD}>
        {ddShown ? <FiX /> : <FiChevronDown />}
      </span>
    </header>
  );
}

const User = () => {
  const { data: session } = useSession();

  const [user, setUser] = useState();

  useEffect(() => {
    getSession().then(async (session) => {
      if (!session) return;
      const { response, error } = await fetch("/api/twitter/", {
        method: "GET",
        headers: {
          endpoint: `https://api.twitter.com/2/users/${session.user.id}`,
        },
      }).then((res) => res.json());

      if (!error) {
        setUser(response);
      }
    });
  }, []);

  return null;
};

export default Nav;
