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

const CHOCOLATEY_TABLE = [
  { feature: "Windows Integration", win: "Built on Microsoft Winget, included in modern Windows", other: "Separate package management ecosystem" },
  { feature: "Getting Started", win: "Instant browser-based setup", other: "Requires installing and configuring Chocolatey" },
  { feature: "Setup Experience", win: "Fast, lightweight, and beginner friendly", other: "Complicated, more technical and CLI-oriented" },
  { feature: "Best Use Case", win: "New PC setup, onboarding, app discovery", other: "Complicated scripting and infrastructure workflows" },
  { feature: "Maintenance Overhead", win: "Minimal, native Windows experience", other: "Additional package manager to maintain" },
  { feature: "Future Direction", win: "Built around Microsoft's modern Windows ecosystem", other: "Maintained by other community" },
];

const CHOCOLATEY_FAQ = [
  { q: "Is Winstall.app a good Chocolatey alternative?", a: "Yes. Winstall.app is a modern alternative for users who want a simpler and more lightweight Windows package management experience powered by Microsoft Winget. Instead of maintaining a separate package manager ecosystem, Winstall.app works directly with the native Windows package manager already included in modern Windows." },
  { q: "Why use Winget instead of Chocolatey?", a: "Winget is Microsoft's official Windows package manager and is built directly into modern Windows systems. It offers a more native and lightweight experience without requiring users to install and maintain an additional package management platform." },
  { q: "Is Chocolatey still necessary if I already use Winget?", a: "For many users, no. Winget now supports a large and rapidly growing package ecosystem, while Winstall.app makes app discovery, setup, and reusable install workflows significantly easier." },
  { q: "Is Winstall.app better for setting up a new PC?", a: "Yes. Winstall.app is optimized for modern onboarding and setup workflows. You can quickly discover apps, create reusable install collections, and install everything using Winget in just a few minutes." },
];

export default function CompareChocolatey() {
  return (
    <div className={styles.detailPage}>
      <MetaTags
        title="Winstall vs Chocolatey - Comparison | winstall"
        path="/compare-chocolatey"
        desc="Compare Winstall.app with Chocolatey. Use Microsoft's native Windows package manager without extra dependencies."
      />

      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroContent}>
            <CompareTabs active="/compare-chocolatey" />
            <h1>
              Best Chocolatey Alternative - Winstall.app
            </h1>
            <p>
              A simpler Chocolatey alternative powered by Microsoft Winget. Discover apps, build shareable install bundles, and set up Windows software without another package manager.
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
              <span>Chocolatey</span>
            </div>
            <div className={styles.codeBlock}>
              <pre>
                <span className={styles.cmd}>choco install</span>{" "}
                <span className={styles.pkg}>googlechrome{"\n"}</span>
                <span className={styles.pkg}>firefox</span>{" "}
                <span className={styles.pkg}>vscode</span>{" "}
                <span className={styles.pkg}>7zip</span>{" "}
                <span className={styles.pkg}>vlc{"\n"}</span>
                <span className={styles.pkg}>notepadplusplus</span>
              </pre>
            </div>
          </div>

          <div className={styles.vsIndicator}>VS</div>
          </div>
        </div>

        <div className={styles.trustBar}>
          <div className={styles.trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span>Built on Winget</span>
          </div>
          <div className={styles.trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <span>No Extra Package Manager</span>
          </div>
          <div className={styles.trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span>Modern Windows Workflow</span>
          </div>
          <div className={styles.trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Faster New PC Setup</span>
          </div>
        </div>
      </section>

      <section className={styles.featureComparison}>
        <div className={styles.sectionHeader}>
          <h2>Winstall.app vs Chocolatey Feature Comparison</h2>
          <p>See how Winstall.app compares to Chocolatey across the features that matter.</p>
        </div>

        <div className={styles.comparisonTable}>
          <div className={styles.tableHeader}>
            <div className={styles.colFeature}>Feature</div>
            <div className={styles.colWinstall}>Winstall.app (Winget)</div>
            <div className={styles.colOther}>Chocolatey</div>
          </div>
          {CHOCOLATEY_TABLE.map((row) => (
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
          {CHOCOLATEY_FAQ.map((item) => (
            <div key={item.q} className={styles.faqCard}>
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaBox}>
          <h2>Skip the legacy package manager workflow.</h2>
          <p>
            Use Winget the modern way: directly from your browser, powered by Microsoft's native Windows package ecosystem.
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
