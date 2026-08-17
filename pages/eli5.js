import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { FiCopy } from "react-icons/fi";
import MetaTags from "../components/MetaTags";
import Footer from "../components/Footer";
import styles from "../styles/eli5.module.scss";
import { getDocumentShellStaticProps } from "../utils/documentShellStaticProps";

const APP_INSTALLER_URL = "https://apps.microsoft.com/detail/9nblggh4nns1";

const FAQ_ITEMS = [
  {
    q: "Is winget safe to use?",
    a: "Yes. Winget is an official Microsoft tool built into Windows. Packages come from sources Microsoft ships by default—mainly the open-source winget Community Repository and the Microsoft Store—so you're not downloading random installers from unknown websites.",
  },
  {
    q: "Do I need to run winget as an administrator?",
    a: "Only sometimes. Some apps install machine-wide and need admin rights; others install just for your user account. Winget prompts you for permission automatically when it's needed.",
  },
  {
    q: "What is a package ID?",
    a: "A package ID like VideoLAN.VLC uniquely identifies one app in Publisher.AppName format. On winstall you don't look it up yourself—select apps and Generate Script, or copy the command from any app page.",
  },
  {
    q: "Does winget work on Windows 10?",
    a: "Yes, on Windows 10 version 1809 and later, as long as App Installer is up to date via the Microsoft Store. It ships by default on Windows 11.",
  },
  {
    q: "Can I uninstall an app with winget too?",
    a: "winget uninstall --id Publisher.AppName removes it just as easily as winget install added it.",
  },
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.plain || item.a,
    },
  })),
};

function CopyCommand({ command }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
    } catch {
      // ignore clipboard failures
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      className={`${styles.copyBlock} ${copied ? styles.copyBlockCopied : ""}`}
      onClick={handleCopy}
      aria-label={`Copy command: ${command}`}
    >
      {copied ? (
        <span className={styles.copiedText}>✓ Copied to clipboard!</span>
      ) : (
        <>
          <span className={styles.cmd}>{command}</span>
          <span className={styles.clipboard}>
            <FiCopy size={18} />
          </span>
        </>
      )}
    </button>
  );
}

function FaqGrid() {
  return (
    <div className={styles.faqBlock}>
      <div className={styles.faqIntro}>
        <div className={styles.subHeading}>Common Questions</div>
        <p>Short answers to the things people usually ask before they try winget.</p>
      </div>
      <div className={styles.faqGrid}>
        {FAQ_ITEMS.map((item) => (
          <div key={item.q} className={styles.faqTile}>
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Explainer() {
  return (
    <div className={styles.eli5Page}>
      <MetaTags
        title="How Winget Works (and How to Use winstall) | winstall"
        path="/eli5"
        desc="New to Winget? Learn what Windows Package Manager is, the only 3 commands you need, and how to use winstall: select apps, generate an install script, and paste it into Terminal. No command line experience required."
      />
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
        />
      </Head>

      <div className={styles.pageHero}>
        <div className={styles.heroBadge}>Help</div>
        <h1>What Is Winget, and How Do You Actually Use It?</h1>
        <p className={styles.heroLead}>
          Winget is the app installer Microsoft already built into Windows.
          winstall is the browser UI on top of it: find apps, pick several at
          once, and generate an install script you can paste into Terminal.
          Here&apos;s everything you need, in under 5 minutes.
        </p>
        <div className={styles.jumpPills}>
          <a href="#winget" className={styles.pill}>
            How Winget Works
          </a>
          <a href="#winstall" className={styles.pillAccent}>
            How to Use winstall
          </a>
        </div>
      </div>

      <div className={styles.mainCol}>
        <div className={styles.tldrBox}>
          <strong>TL;DR:</strong> Winget is Windows&apos; built-in, official
          command-line app installer, no download required on modern Windows.
          winstall is a free web app for it: search the catalog in plain English,
          select the apps you want, then hit <strong>Generate Script</strong> to
          get a ready-to-paste command (or a downloadable .bat / .ps1) so you
          never have to guess a package name.
        </div>

        <div className={styles.contentCol}>
          <section id="winget" className={styles.contentSection}>
          <h2 className={styles.blockHeader}>How Winget Works</h2>
          <p className={styles.leadText}>
            Winget (Windows Package Manager) is Microsoft&apos;s official
            command-line tool for installing, updating, and removing software on
            Windows. It&apos;s shipped inside Windows 11 and modern Windows 10
            updates since 2020, so there&apos;s a good chance you already have
            it.
          </p>

          <div className={styles.stepBlock}>
            <div className={styles.subHeading}>
              Step 1. Check you already have it
            </div>
            <p className={styles.stepText}>
              Open Terminal, PowerShell, or Command Prompt and paste this in:
            </p>
            <CopyCommand command="winget --version" />
            <p className={styles.commandCaption}>
              See a version number? You&apos;re ready to go. See an error
              instead? Install or update App Installer from the Microsoft Store,
              then open a new terminal and try again.
            </p>
            <a
              href={APP_INSTALLER_URL}
              className={styles.ghostLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get App Installer from Microsoft Store ›
            </a>
          </div>

          <div className={styles.stepBlock}>
            <div className={styles.subHeading}>
              Step 2. Learn the only 3 commands you need
            </div>

            <CopyCommand command='winget search "vlc"' />
            <p className={styles.commandCaption}>
              Find the exact package for any app by name.
            </p>

            <CopyCommand command="winget install -e --id VideoLAN.VLC" />
            <p className={styles.commandCaption}>
              Installs it. The <span className={styles.ci}>-e</span> flag means
              exact match, so you always get the right package.
            </p>

            <CopyCommand command="winget upgrade --all" />
            <p className={styles.commandCaption}>
              Updates every app winget manages, all in one line.
            </p>
          </div>

          <FaqGrid />
        </section>

        <section id="winstall" className={styles.contentSection}>
          <h2 className={styles.blockHeader}>How to Use winstall</h2>
          <p className={styles.leadText}>
            Winget is powerful, but remembering exact package IDs is painful.
            winstall runs in your browser: pick the apps you want, then generate
            one install script that installs them all with Winget. No extra
            software to install.
          </p>

          <ol className={styles.bpList}>
            <li>
              <span className={styles.bpNum}>1</span>
              <div>
                <div className={styles.bpTitle}>Search or browse</div>
                <div className={styles.bpDesc}>
                  Find apps from the homepage search, browse the full catalog
                  under Discover Apps, or open Express Setup for a curated list
                  of popular apps for a new PC.
                </div>
              </div>
            </li>
            <li>
              <span className={styles.bpNum}>2</span>
              <div>
                <div className={styles.bpTitle}>Select the apps you want</div>
                <div className={styles.bpDesc}>
                  Select the app on the app tile, or click{" "}
                  <strong>+ Add to list</strong> in the app detail view. A bar
                  at the bottom of the screen tracks how many you&apos;ve
                  selected. You can mix apps from different pages; your
                  selection sticks as you browse.
                </div>
              </div>
            </li>
            <li>
              <span className={styles.bpNum}>3</span>
              <div>
                <div className={styles.bpTitle}>Install Apps</div>
                <div className={styles.bpDesc}>
                  In the install page, you can download an installer or generate
                  a script. Copy the command into Terminal, PowerShell, or
                  Command Prompt and press Enter to install the apps one-by-one
                  with Winget. Prefer a file? Download a{" "}
                  <span className={styles.ci}>.bat</span> or{" "}
                  <span className={styles.ci}>.ps1</span> and run it (your
                  browser may warn you; the file is safe). You can also switch
                  to a PowerShell script or download a custom installer from the
                  same screen.
                </div>
              </div>
            </li>
            <li>
              <span className={styles.bpNum}>4</span>
              <div>
                <div className={styles.bpTitle}>
                  Optional: one app, or a reusable pack
                </div>
                <div className={styles.bpDesc}>
                  On any single app page you can still copy one ready-to-paste{" "}
                  <span className={styles.ci}>winget install</span> command.
                  Want the same list next time? Save your picks as an{" "}
                  <Link href="/packs" className={styles.inlineLink}>
                    App Pack
                  </Link>
                  .
                </div>
              </div>
            </li>
          </ol>

          <div className={styles.sectionActions}>
            <Link href="/apps" className={styles.btnPrimary}>
              Browse All Apps
            </Link>
            <Link href="/express" className={styles.btnSecondary}>
              Open Express Setup
            </Link>
          </div>
        </section>

        </div>
      </div>

      <Footer />
    </div>
  );
}

export async function getStaticProps() {
  return getDocumentShellStaticProps();
}
