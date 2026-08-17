import Link from "next/link";
import MetaTags from "../components/MetaTags";
import Footer from "../components/Footer";
import styles from "../styles/compareDetail.module.scss";
import { getDocumentShellStaticProps } from "../utils/documentShellStaticProps";

function CompareTabs({ active }) {
  const tabs = [
    { label: "vs Ninite", page: "/compare-ninite" },
    { label: "vs UniGetUI", page: "/compare-unigetui" },
    { label: "vs Chocolatey", page: "/compare-chocolatey" },
  ];

  return (
    <div className={styles.tabs}>
      {tabs.map((tab) => (
        <Link
          key={tab.label}
          href={tab.page}
          className={`${styles.tab} ${tab.page === active ? styles.active : ""}`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

function StatusCell({ text, positive }) {
  return (
    <div className={styles.statusCell}>
      <span className={`${styles.statusIcon} ${positive ? styles.positive : styles.negative}`}>
        {positive ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        )}
      </span>
      <span className={styles.statusText}>{text}</span>
    </div>
  );
}

const UNIGETUI_TABLE = [
  { feature: "Getting Started", win: "Instant browser-based experience with no installation required", other: "Requires downloading and installing a desktop application" },
  { feature: "Setup Workflow", win: "Simple. Fast app discovery and Winget setup in minutes", other: "Complicated. More traditional package manager workflow" },
  { feature: "Share & Reuse", win: "Share install collections with a single link", other: "Limited sharing and onboarding workflow" },
  { feature: "User Experience", win: "Lightweight, beginner-friendly, and focused", other: "Complicated interface for users" },
  { feature: "Automation & Scripting", win: "Export reusable Winget commands for automation and CI workflows", other: "No automation and scripting capability" },
  { feature: "Modern Workflow", win: "Discover → Share → Install directly from browser", other: "Install and manage packages through a local desktop UI" },
];

const UNIGETUI_FAQ = [
  { q: "Is Winstall.app a good UniGetUI alternative?", a: "Yes. Winstall.app is a lightweight alternative to UniGetUI for users who want a faster and simpler way to use Winget. Instead of installing another desktop application, Winstall.app lets you discover apps, generate install commands, and share software collections directly from your browser." },
  { q: "Do I need UniGetUI if I already use Winget?", a: "Not necessarily. Winget already works natively in Windows 10 and 11. Winstall.app enhances the Winget experience with package discovery, curated collections, and reusable install commands without adding another package management layer." },
  { q: "What makes Winstall.app different from UniGetUI?", a: "UniGetUI focuses on desktop package management and maintenance workflows. Winstall.app focuses on fast setup, app discovery, onboarding, and shareable install experiences powered by Winget." },
  { q: "Is Winstall.app better for setting up a new PC?", a: "For many users, yes. Winstall.app is optimized for quickly installing multiple applications on a fresh Windows setup. You can create reusable install collections and launch them instantly using Winget." },
];

export default function CompareUniGetUI() {
  return (
    <div className={styles.detailPage}>
      <MetaTags
        title="Winstall vs UniGetUI - Comparison | winstall"
        path="/compare-unigetui"
        desc="Compare Winstall.app with UniGetUI. Discover, share, and install apps with Winget directly from your browser."
      />

      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroContent}>
            <CompareTabs active="/compare-unigetui" />
            <h1>
              Best UniGetUI Alternative - Winstall.app
            </h1>
            <p>
              A simpler UniGetUI alternative built for fast Winget installs. Discover apps, create shareable collections, and generate install commands without downloading a desktop app.
            </p>
            <div className={styles.actions}>
              <a href="/" className={styles.btnPrimary}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Start Installing Apps
              </a>
              <a href="/apps" className={styles.btnSecondary}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Browse Packages
              </a>
            </div>
          </div>

          <div className={styles.visualCompare}>
          <div className={styles.compareLeft}>
            <div className={styles.compareHeader}>
              <span className={styles.wIcon}>W</span>
              <span>Winstall.app</span>
            </div>
            <div className={styles.codeBlock}>
              <pre>
                <span className={styles.cmd}>winget install</span> \{"\n"}
                <span className={styles.pkg}>Google.Chrome Mozilla.Firefox{"\n"}</span>
                <span className={styles.pkg}>Microsoft.VSCode 7zip.7zip{"\n"}</span>
                <span className={styles.pkg}>VideoLAN.VLC{"\n"}</span>
                <span className={styles.pkg}>Notepad++.Notepad++</span>
              </pre>
            </div>
          </div>

          <div className={styles.compareRight}>
            <div className={styles.compareHeader}>
              <span>UniGetUI</span>
            </div>
            <div className={styles.checklistGrid}>
              {["Winget", "Scoop", "Chocolatey", "Pip", "NPM", ".NET Tool"].map((pkg) => (
                <div key={pkg} className={styles.checkItem}>
                  <span className={styles.checkbox}></span>
                  <span>{pkg}</span>
                </div>
              ))}
            </div>
            <div className={styles.footnote}>Desktop app required</div>
          </div>

          <div className={styles.vsIndicator}>VS</div>
          </div>
        </div>

        <div className={styles.trustBar}>
          <div className={styles.trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <span>No Installation Required</span>
          </div>
          <div className={styles.trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span>Powered by Winget</span>
          </div>
          <div className={styles.trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <span>Share & Reuse</span>
          </div>
          <div className={styles.trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
            <span>Works Anywhere</span>
          </div>
        </div>
      </section>

      <section className={styles.featureComparison}>
        <div className={styles.sectionHeader}>
          <h2>Winstall.app vs UniGetUI Feature Comparison</h2>
          <p>See how Winstall.app compares to UniGetUI across the features that matter.</p>
        </div>

        <div className={styles.comparisonTable}>
          <div className={styles.tableHeader}>
            <div className={styles.colFeature}>Feature</div>
            <div className={styles.colWinstall}>Winstall.app (Winget)</div>
            <div className={styles.colOther}>UniGetUI</div>
          </div>
          {UNIGETUI_TABLE.map((row) => (
            <div key={row.feature} className={styles.tableRow}>
              <div className={styles.colFeature}>{row.feature}</div>
              <div className={styles.colWinstall}>
                <StatusCell text={row.win} positive={true} />
              </div>
              <div className={styles.colOther}>
                <StatusCell text={row.other} positive={false} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.faqSection}>
        <h2>Frequently Asked Questions</h2>
        <div className={styles.faqGrid}>
          {UNIGETUI_FAQ.map((item) => (
            <div key={item.q} className={styles.faqCard}>
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaBox}>
          <h2>Setup your Windows apps the modern way.</h2>
          <p>
            Discover, share, and install apps with Winget directly from your browser.
          </p>
          <a href="/" className={styles.ctaButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Open Winstall.app
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export async function getStaticProps() {
  return getDocumentShellStaticProps();
}
