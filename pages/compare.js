import Link from "next/link";
import MetaTags from "../components/MetaTags";
import Footer from "../components/Footer";
import styles from "../styles/compare.module.scss";
import { FiChevronRight } from "react-icons/fi";
import { getDocumentShellStaticProps } from "../utils/documentShellStaticProps";

function CheckBadge() {
  return (
    <span className={styles.checkBadge}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}

function IconZapFill() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

const COMPARISON_CARDS = [
  {
    competitor: "Ninite",
    page: "/compare-ninite",
    description: "Ninite popularized one-click app installs, but its closed ecosystem is limited to ~100 curated apps. Winstall.app opens the door to 12,000+ packages through the official Winget repository.",
    highlights: ["12,000+ packages vs ~100", "Fully open source", "CLI-first, scriptable & automatable"],
  },
  {
    competitor: "UniGetUI",
    page: "/compare-unigetui",
    description: "UniGetUI (formerly WingetUI) is a desktop app that wraps multiple package managers. Winstall.app takes a lighter approach. No install needed, just open your browser and generate commands.",
    highlights: ["No installation required", "Share collections via link", "Works instantly in any browser"],
  },
  {
    competitor: "Chocolatey",
    page: "/compare-chocolatey",
    description: "Chocolatey has been the go-to Windows package manager for years, but it requires its own CLI setup. Winstall.app leverages the native Winget built into Windows, with zero extra dependencies.",
    highlights: ["Native to Windows 10/11", "No extra CLI to install", "Free forever, no paid tiers"],
  },
];

const STATS = [
  { value: "12k+", label: "Packages" },
  { value: "100%", label: "Free & Open Source" },
  { value: "0", label: "Installs Required" },
];

function ComparisonCard({ competitor, page, description, highlights }) {
  return (
    <div className={styles.comparisonCard}>
      <div className={styles.cardHeader}>
        <span className={styles.vsBadge}>VS</span>
        <span className={styles.competitorName}>{competitor}</span>
      </div>
      <p className={styles.cardDescription}>{description}</p>
      <ul className={styles.highlightsList}>
        {highlights.map((item) => (
          <li key={item}>
            <CheckBadge />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <Link href={page} className={styles.readMore}>
        Read full comparison <FiChevronRight />
      </Link>
    </div>
  );
}

export default function Compare() {
  return (
    <div className={styles.comparePage}>
      <MetaTags
        title="Compare winstall with alternatives | winstall"
        path="/compare"
        desc="See how winstall.app compares to Ninite, UniGetUI, and Chocolatey. Discover the modern way to install Windows apps."
      />

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <span>COMPARISONS</span>
          </div>
          <h1>See How Winstall.app Compares vs Alternatives</h1>
          <p>
            Thinking about switching to the modern Winget-powered way of installing apps?
            See how Winstall.app stacks up against the most popular alternatives.
          </p>
        </div>
      </section>

      <section className={styles.cardsSection}>
        <div className={styles.cardsGrid}>
          {COMPARISON_CARDS.map((card) => (
            <ComparisonCard key={card.competitor} {...card} />
          ))}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <div className={styles.ctaText}>
            <h2>Why developers and IT teams choose Winstall.app</h2>
            <p>
              Built on Microsoft's official Winget package manager, Winstall.app gives you access to the largest
              Windows app ecosystem with a modern web interface, shareable install collections, and full CLI
              automation. No installs, no accounts, no cost.
            </p>
            <a href="/" className={styles.ctaButton}>
              <IconZapFill /> Start Installing Apps
            </a>
          </div>
          <div className={styles.statsGrid}>
            {STATS.map((stat) => (
              <div key={stat.label} className={styles.statCard}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export async function getStaticProps() {
  return getDocumentShellStaticProps();
}
