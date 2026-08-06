import Link from "next/link";
import { FiArrowRight, FiGithub } from "react-icons/fi";
import MetaTags from "../components/MetaTags";
import Footer from "../components/Footer";
import styles from "../styles/about.module.scss";

const GITHUB_REPO = "https://github.com/SplashtopInc/winstall";
const GITHUB_ISSUES = "https://github.com/SplashtopInc/winstall/issues/new";
const SPLASHTOP_URL = "https://www.splashtop.com/";

export default function About() {
  return (
    <div className={styles.aboutPage}>
      <MetaTags
        title="About winstall | Free Winget Search Engine & App Installer"
        path="/about"
        desc="winstall is a free, independent search engine for Windows Package Manager (winget). Learn the story behind winstall, who maintains it, how package data stays accurate, and how to contribute on GitHub."
      />

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>About</div>
          <h1>About winstall</h1>
          <p>
            winstall is a free, independent search engine built on top of Winget,
            Microsoft&apos;s official Windows package manager. We help you find the
            right app and the right install command, without ever needing to
            remember a package ID.
          </p>
        </div>
      </section>

      <div className={styles.contentCol}>
        <section className={styles.contentSection}>
          <h2 className={styles.blockHeader}>Where winstall Came From</h2>
          <p>
            winstall started as a side project by Mehedi Hassan, built to make
            Winget&apos;s huge catalog of Windows software actually searchable.
          </p>
          <p>
            Today it&apos;s owned and maintained by{" "}
            <a
              href={SPLASHTOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.inlineLink}
            >
              Splashtop
            </a>
            , who keep the project funded, the data pipeline running, and new
            features shipping, while keeping winstall itself free and open to
            everyone.
          </p>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.blockHeader}>Who Maintains winstall</h2>
          <p>
            Splashtop builds application and endpoint management software that
            helps IT teams package, deploy, and keep business software up to date
            across their organization.
          </p>
          <p>
            winstall remains a separate, free product for anyone installing
            software on their own Windows PC, not just enterprise IT teams.
          </p>
          <div className={styles.sectionActions}>
            <a
              href={SPLASHTOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnSecondary}
            >
              Visit splashtop.com
            </a>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.blockHeader}>
            How We Keep Package Data Accurate
          </h2>
          <p>
            Every application on winstall is backed by a custom API that regularly
            checks Microsoft&apos;s{" "}
            <a
              href="https://github.com/microsoft/winget-pkgs"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.inlineLink}
            >
              official winget repository
            </a>
            . Package details refresh automatically every 15 minutes on weekdays
            and every 3 hours on weekends, so the install commands you copy are
            always current.
          </p>
          <Link href="/eli5" className={styles.nextLink}>
            <div>
              <div className={styles.nextLinkText}>New to winget?</div>
              <div className={styles.nextLinkSub}>
                Read the beginner&apos;s guide to winget and winstall
              </div>
            </div>
            <FiArrowRight className={styles.nextLinkArrow} size={18} />
          </Link>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.blockHeader}>Open Source &amp; Contributing</h2>
          <p>
            winstall is completely open source. Read the code, file a bug, or
            contribute a fix on GitHub.
          </p>
          <div className={styles.sectionActions}>
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnPrimary}
            >
              <FiGithub size={18} />
              View Source on GitHub
            </a>
            <a
              href={GITHUB_ISSUES}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnSecondary}
            >
              Report a Bug
            </a>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
