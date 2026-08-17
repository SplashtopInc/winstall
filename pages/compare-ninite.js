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

const NINITE_TABLE = [
  { feature: "Package Ecosystem", win: "12,000+ packages and growing", other: "Limited, ~100 popular apps" },
  { feature: "Open Source", win: "Fully open source, community driven", other: "Closed source" },
  { feature: "Community Packages", win: "Anyone can contribute packages", other: "No community contributions" },
  { feature: "Automation", win: "Export commands, share collections, scriptable", other: "Manual selections only" },
  { feature: "Discoverability", win: "Browse, search, filter 20k+ packages", other: "Fixed categories only" },
  { feature: "Developer Friendly", win: "CLI first, CI/CD ready", other: "Not designed for developers" },
  { feature: "Pricing", win: "Free, forever", other: "Free personal only, paid enterprise" },
];

const NINITE_FAQ = [
  { q: "Is Winstall.app better than Ninite?", a: "Winstall.app offers both the simplicity of Ninite through Express Setup and the flexibility of the modern Winget ecosystem. You get access to 12,000+ packages, open-source transparency, shareable install scripts, and developer-friendly automation, while still supporting quick multi-app installation similar to Ninite." },
  { q: "Can I switch from Ninite to Winstall.app?", a: "Yes. Most popular apps available on Ninite are also in the Winget repository. Just search for them on Winstall.app, build your collection, and generate the install command. No migration tool needed." },
  { q: "Is Winstall.app free?", a: "Yes, completely free and open source with no paid tiers. Ninite is free for personal use but charges for its enterprise Pro version." },
  { q: "Does Winstall.app require installation?", a: "No. Winstall.app runs entirely in your browser and generates Winget commands for your terminal. No downloads, no extra software. All you need is Windows 10/11 with Winget." },
];

export default function CompareNinite() {
  return (
    <div className={styles.detailPage}>
      <MetaTags
        title="Winstall vs Ninite - Comparison | winstall"
        path="/compare-ninite"
        desc="Compare Winstall.app with Ninite. See how the modern Winget-powered approach stacks up against the classic installer."
      />

      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroContent}>
            <CompareTabs active="/compare-ninite" />
            <h1>
              Best Ninite Alternative - Winstall.app
            </h1>
            <p>
              A simpler, more flexible Ninite alternative powered by Winget. Install more apps, build shareable bundles, and generate commands without downloads or paid tiers.
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
              <span>Ninite</span>
            </div>
            <div className={styles.checklistGrid}>
              {["Chrome", "Firefox", "VLC", "7-Zip", "GIMP", "Notepad++", "Paint.NET", "WinRAR"].map((app) => (
                <div key={app} className={styles.checkItem}>
                  <span className={styles.checkbox}></span>
                  <span>{app}</span>
                </div>
              ))}
            </div>
            <div className={styles.footnote}>~100 apps total</div>
          </div>

          <div className={styles.vsIndicator}>VS</div>
          </div>
        </div>

        <div className={styles.trustBar}>
          <div className={styles.trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>100% Free & Open Source</span>
          </div>
          <div className={styles.trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span>Powered by Microsoft Winget</span>
          </div>
          <div className={styles.trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <span>No Installation Required</span>
          </div>
          <div className={styles.trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <span>12,000+ Packages</span>
          </div>
        </div>
      </section>

      <section className={styles.featureComparison}>
        <div className={styles.sectionHeader}>
          <h2>Winstall.app vs Ninite Feature Comparison</h2>
          <p>See how Winstall.app compares to Ninite across the features that matter.</p>
        </div>

        <div className={styles.comparisonTable}>
          <div className={styles.tableHeader}>
            <div className={styles.colFeature}>Feature</div>
            <div className={styles.colWinstall}>Winstall.app (Winget)</div>
            <div className={styles.colOther}>Ninite</div>
          </div>
          {NINITE_TABLE.map((row) => (
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
          {NINITE_FAQ.map((item) => (
            <div key={item.q} className={styles.faqCard}>
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaBox}>
          <h2>Ready to try the modern way?</h2>
          <p>
            Join thousands of users who prefer the Winget-powered approach to installing apps on Windows.
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
