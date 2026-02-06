import React, { useEffect, useContext } from "react";
import styles from "../styles/footer.module.scss";
import Link from "next/link";
import { FiChevronUp } from "react-icons/fi";
import SelectedContext from "../ctx/SelectedContext";

export default function Footer() {
  const { selectedApps, setSelectedApps } = useContext(SelectedContext);

  useEffect(() => {
    window.onscroll = function () {
      scrollFunction();
    };
  }, []);

  const scrollFunction = () => {
    const btnTop = document.getElementById("btnTop");

    if (
      (document.body.scrollTop > 20 ||
        document.documentElement.scrollTop > 20) &&
      btnTop
    ) {
      btnTop.style.display = "flex";
    } else if (btnTop) {
      btnTop.style.display = "none";
    }
  };

  const topFunction = () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };

  return (
    <div className={styles.footer}>
      <a
        href="https://www.splashtop.com"
        target="_blank"
        className={styles.brand}
      >
        <img
          src={"/assets/splashtop-small.png"}
          alt="splashtop logo"
          draggable={false}
        />
        <div>
          <p>A service by Splashtop Inc.</p>
        </div>
      </a>

      <ul>
        <li>
          <a
            href="https://github.com/SplashtopInc/winstall"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </li>
        <li>
          <Link href="/privacy">
            <a>Privacy Policy</a>
          </Link>
        </li>
        <li>
          <Link href="/eli5">
            <a>Help</a>
          </Link>
        </li>
      </ul>

      <span
        id="btnTop"
        title="Go to top"
        onClick={topFunction}
        className={`${styles.backToTop} ${selectedApps.length !== 0 ? styles.selectionOpen : ""
          }`}
      >
        <FiChevronUp />
      </span>
    </div>
  );
}
