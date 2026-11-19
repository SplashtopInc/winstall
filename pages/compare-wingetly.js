import MetaTags from "../components/MetaTags";
import Footer from "../components/Footer";
import CompareTabs from "../components/compareTabs";
import CompareStatusCell from "../components/compareStatusCell";
import styles from "../styles/compareDetail.module.scss";
import { getDocumentShellStaticProps } from "../utils/documentShellStaticProps";

const WINGETLY_TABLE = [
  {
    feature: "AI-Powered Search",
    win: "Describe what you need in natural language. AI understands your intent and finds relevant apps.",
    other: "Traditional keyword search with advanced field filters.",
    winTone: "positive",
    otherTone: "negative",
  },
  {
    feature: "Favorites",
    win: "Like apps and packs, then reopen them from Favorites",
    other: "No saved favorites",
    winTone: "positive",
    otherTone: "negative",
  },
  {
    feature: "Create Packs",
    win: "Create named packs that stay on your account",
    other: "Packs stay in this browser",
    winTone: "positive",
    otherTone: "negative",
  },
  {
    feature: "Share Packs",
    win: "Public /packs page, copy link, social share, and a README badge",
    other: "A share link only preloads the same browser list",
    winTone: "positive",
    otherTone: "negative",
  },
  {
    feature: "Getting Started",
    win: "Express setup and category browse for a new PC",
    other: "Search and a pack builder, without Express or categories",
    winTone: "positive",
    otherTone: "negative",
  },
  {
    feature: "Open Source",
    win: "Fully open source, community driven",
    other: "Closed source",
    winTone: "positive",
    otherTone: "negative",
  },
];

const WINGETLY_FAQ = [
  {
    q: "How does Winstall.app search differ from Wingetly?",
    a: "Winstall.app uses AI-powered search: describe what you need in natural language, and it finds relevant apps from your intent. Wingetly uses traditional keyword search with advanced field filters.",
  },
  {
    q: "Can I save apps and packs I like?",
    a: "Yes. Sign in, like an app or a pack, and open them later from Favorites. Wingetly does not keep a favorites list.",
  },
  {
    q: "Can I create a pack and share it?",
    a: "Yes. Create a named pack on your account, make it public, and share a stable /packs page. Anyone can copy the link, post it to X, Facebook, or LinkedIn, or paste a README badge. Wingetly packs stay in the browser; a share link there only preloads that list.",
  },
  {
    q: "Why does open source matter here?",
    a: "Winstall.app is fully open source and community driven. Anyone can read the code, open issues, and contribute. That keeps the product moving: AI search, favorites, public packs, and Express setup ship in the open, so the site can iterate quickly without waiting on a closed catalog.",
  },
];

export default function CompareWingetly() {
  return (
    <div className={styles.detailPage}>
      <MetaTags
        title="Winstall vs Wingetly - Comparison | winstall"
        path="/compare-wingetly"
        desc="Compare Winstall.app with Wingetly. AI-powered natural language search, favorites, and packs you can create and share."
      />

      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroContent}>
            <CompareTabs active="/compare-wingetly" />
            <h1>Best Wingetly Alternative - Winstall.app</h1>
            <p>
              Go beyond keyword search. Describe what you need in natural language, save your favorite apps, and create shareable packs anyone can open. Wingetly focuses on keyword-based app discovery and browser-stored lists.
            </p>
            <div className={styles.actions}>
              <a href="/" className={styles.btnPrimary}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Start Installing Apps
              </a>
              <a href="/packs" className={styles.btnSecondary}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Browse Packs
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
                  <span className={styles.cmd}>a quiet music player</span>
                </pre>
              </div>
              <div className={styles.footnote}>AI finds apps from what you mean</div>
            </div>

            <div className={styles.compareRight}>
              <div className={styles.compareHeader}>
                <span>Wingetly</span>
              </div>
              <div className={styles.codeBlock}>
                <pre>
                  <span className={styles.pkg}>tags:music player</span>
                </pre>
              </div>
              <div className={styles.footnote}>Keyword and field filters</div>
            </div>

            <div className={styles.vsIndicator}>VS</div>
          </div>
        </div>

        <div className={styles.trustBar}>
          <div className={styles.trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>AI-Powered Search</span>
          </div>
          <div className={styles.trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>Favorites</span>
          </div>
          <div className={styles.trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span>Create and Share Packs</span>
          </div>
          <div className={styles.trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span>Open Source</span>
          </div>
        </div>
      </section>

      <section className={styles.featureComparison}>
        <div className={styles.sectionHeader}>
          <h2>Winstall.app vs Wingetly Feature Comparison</h2>
          <p>AI-powered search, favorites, and packs you create and share.</p>
        </div>

        <div className={styles.comparisonTable}>
          <div className={styles.tableHeader}>
            <div className={styles.colFeature}>Feature</div>
            <div className={styles.colWinstall}>Winstall.app</div>
            <div className={styles.colOther}>Wingetly</div>
          </div>
          {WINGETLY_TABLE.map((row) => (
            <div key={row.feature} className={styles.tableRow}>
              <div className={styles.colFeature}>{row.feature}</div>
              <div className={styles.colWinstall}>
                <CompareStatusCell text={row.win} tone={row.winTone} />
              </div>
              <div className={styles.colOther}>
                <CompareStatusCell text={row.other} tone={row.otherTone} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.faqSection}>
        <h2>Frequently Asked Questions</h2>
        <div className={styles.faqGrid}>
          {WINGETLY_FAQ.map((item) => (
            <div key={item.q} className={styles.faqCard}>
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaBox}>
          <h2>Search it, save it, then share the pack.</h2>
          <p>
            Describe what you need, keep favorites, and hand someone a public pack page.
          </p>
          <a href="/packs" className={styles.ctaButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Browse Packs
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
