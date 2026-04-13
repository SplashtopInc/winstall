import {useState, useContext, useEffect, useRef} from "react";
import styles from "../styles/singleApp.module.scss";
import SelectedContext from "../ctx/SelectedContext";
import Link from "next/link";
import { useRouter } from "next/router";

import {
  FiExternalLink,
  FiDownload,
  FiChevronDown,
  FiChevronUp,
  FiPackage,
  FiPlus,
  FiClock,
  FiCode,
  FiFileText,
  FiAlertOctagon,
  FiTag,
  FiShare2,
  FiTerminal,
  FiUser,
  FiCopy,
  FiCheckCircle
} from "react-icons/fi";
import { FaFacebook, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { IoIosLink } from "react-icons/io";

import AppIcon from "./AppIcon";
import { buildSiteUrl, compareVersion, timeAgo } from "../utils/helpers";


let SingleApp = ({ app, onVersionChange = false, large = false, showTime = false, pack = false, displaySelect = false, preventGlobalSelect, hideBorder=false, preSelected=false}) => {
  const [selected, setSelected] = useState(false);
  const { selectedApps, setSelectedApps } = useContext(SelectedContext);

  const [version, setVersion] = useState(app.latestVersion);

  if (!app.selectedVersion) app.selectedVersion = version;

  if (app.versions && app.versions.length > 1) {
    app.versions = app.versions.sort((a, b) =>
      compareVersion(b.version, a.version)
    );
    // make sure latest version is sorted
    app.latestVersion = app.versions[0].version;
  }

  useEffect(() => {
    if(preSelected){
      setSelected(true);
      return;
    }

    let found = selectedApps.find((a) => a._id === app._id);

    if (!found){
      if(selected){
        setSelected(false);
      }

      return;
    };

    if (found.selectedVersion !== app.latestVersion) {
      setVersion(found.selectedVersion);
    }

    setSelected(true);
  }, [selectedApps, app._id]);

  let handleAppSelect = () => {
    if (preventGlobalSelect) {
      preventGlobalSelect(app, !selected);
      setSelected(!selected);
      return;
    }

    let found = selectedApps.findIndex((a) => a._id === app._id);

    if (found !== -1) {
      let updatedSelectedApps = selectedApps.filter(
        (a, index) => index !== found
      );

      setSelectedApps(updatedSelectedApps);
      setSelected(false);
    } else if(app){
      setSelected(true);
      setSelectedApps([...selectedApps, app]);
    }

  };


  if (!app || !app.name) return <></>;

  let VersionSelector = () => {
    console.assert(app.versions);
    return (
      <div className={styles.versions}>
        <select
          className={styles.versionSelector}
          value={version}
          onClick={(e) => e.stopPropagation()}
          id="v-selector"
          name="Select app version"
          onChange={(e) => {
            setVersion(e.target.value);
            app.selectedVersion = e.target.value;

            if (selected) {
              let found = selectedApps.find((a) => a._id === app._id);
              found.selectedVersion = e.target.value;

              if(onVersionChange) onVersionChange();
            }
          }}
        >
          {app.versions.map((v) => {
            return (
              <option key={v.version} value={v.version}>
                v{v.version}
              </option>
            );
          })}
        </select>
        <FiChevronDown/>
        {app.versions.length > 1 && (
          <span>
            <label htmlFor="v-selector">
              ({app.versions.length - 1} other{" "}
              {app.versions.length - 1 > 1 ? "versions" : "version"} available)
            </label>
          </span>
        )}
      </div>
    );
  };

  const [showShareCard, setShowShareCard] = useState(false);
  const shareCardRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareCardRef.current && !shareCardRef.current.contains(event.target)) {
        setShowShareCard(false);
      }
    };

    if (showShareCard) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareCard]);

  const handleShare = () => {
    setShowShareCard(!showShareCard);
  }

  return (
    <li
      key={app._id}
      // onClick={handleAppSelect}
      className={`${hideBorder ? styles.noBorder: "" }${large ? styles.large : ""} ${pack ? styles.pack : ""} ${styles.single} ${
        selected ? styles.selected : ""
      }`}
    >
      <div className={styles.info}>
        <h3>
          {large ? (
            <>
              <AppIcon id={app._id} name={app.name} icon={app.icon} iconUrl={app.iconUrl} iconPng={app.iconPng} />
              Install {app.name} with winget
            </>
          ) : (
            <Link href="/apps/[id]" as={`/apps/${app._id}`} prefetch={false}>
              <AppIcon id={app._id} name={app.name} icon={app.icon} iconUrl={app.iconUrl} iconPng={app.iconPng} />
              <p>{app.name}</p>
            </Link>
          )}

          {displaySelect &&  (
            <button
              className={styles.selectApp}
              onClick={handleAppSelect}
              aria-label={selected ? "Unselect app" : "Select app"}
            >
              <FiPlus />
            </button>
          )}
        </h3>

      </div>

      {large && (
        <>
          <p>
            To install {app.name} with winget, use the following command:
          </p>
          <Copy id={app._id} version={version} latestVersion={app.latestVersion} />
        </>
      )}
      {!pack && <Description name={app.name} desc={app.desc} id={app._id} full={large} />}
      <ul className={styles.metaData}>

        {(showTime || large) && (
          <li>
            <FiClock />
            <span>Last updated {timeAgo(app.updatedAt)}</span>
          </li>
        )}

        {!pack && (
          <li className={app.versions && app.versions.length > 1 ? styles.hover : ""}>
            <FiPackage />
            {large && app.versions && app.versions.length > 1 ? (
              <VersionSelector />
            ) : (
              <Link href="/apps/[id]" as={`/apps/${app._id}`} prefetch={false}>
                v{app.selectedVersion}
              </Link>
            )}
          </li>
        )}

        <li>
          <Link href={`/apps?q=${`publisher: ${app.publisher}`}`}>
            <FiUser />
            Other apps by {app.publisher}
          </Link>
        </li>

        {app.homepage && large && (
          <li>
            <a
              href={`${app.homepage}?ref=winstall`}
              target="_blank"
              rel="noopener noreferrer ugc"
              onClick={(e) => e.stopPropagation()}
            >
              <FiExternalLink />
              View Site
            </a>
          </li>
        )}

        {large && (
          <li>
            <Link href={`https://github.com/microsoft/winget-pkgs/tree/master/manifests/${app._id.substring(0, 1).toLowerCase()}/${app._id.replaceAll('.', '/')}/`}>
              <FiCode />
              Source code for winget package
            </Link>
          </li>
        )}

        {!pack && large && (
          <li>
            <a
              href={`${
                app.versions.find((i) => i.version === app.selectedVersion)
                  .installers[0]
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <FiDownload />
              Download{" "}
              {app.versions.find((i) => i.version === app.selectedVersion).installerType
                ? `(.${app.versions.find((i) => i.version === app.selectedVersion).installerType.toLowerCase()})`
                : ""}
            </a>
          </li>
        )}

        {large && <ExtraMetadata app={app} />}
      </ul>

      {large && app.tags && app.tags.length > 1 && <Tags tags={app.tags} />}

      {large && (
        <div className={styles.largeAppButtons}>
          <button className={styles.selectApp} onClick={handleAppSelect}>
            <FiPlus />
            {selected ? "Unselect" : "Select"} app
          </button>
          <div className={styles.shareContainer}>
            <button className={`button ${styles.shareApp}`} onClick={handleShare}>
              <FiShare2 />
              Share
            </button>
            {showShareCard && (
              <ShareCard
                app={app}
                shareCardRef={shareCardRef}
              />
            )}
          </div>
        </div>
      )}
    </li>
  );
};

const Description = ({ name, desc, id, full }) => {
  const [descTrimmed, setDescTrimmed] = useState(desc.length > 140);
  const router = useRouter();

  let toggleDescription = (e, status) => {
    e.stopPropagation();

    if(desc.length > 340){
      router.push('/apps/[id]', `/apps/${id}`)
      return;
    };

    setDescTrimmed(status);
  };

  if(!desc) return <p>No description available for this app.</p>


  return (
    <>
      {full && (
        <h4>About {name}</h4>
      )}
      <p>
        {desc.length > 140
          ? !descTrimmed || full
            ? desc
            : `${desc.substr(0, 140).replace(/(^[\s]+|[\s]+$)/g, "")}...`
          : desc}
      </p>

      {desc.length > 140 && !full && (
        <button
          onClick={(e) => toggleDescription(e, !descTrimmed)}
          className={styles.subtle}
        >
          {descTrimmed ? (
            <>
              Full Description
              <FiChevronDown />
            </>
          ) : (
            <>
              Hide Description
              <FiChevronUp />
            </>
          )}
        </button>
      )}
    </>
  );
};

const ExtraMetadata = ({ app }) => {
  return (
    <>
      {
        app.minOS && (
          <li>
            <FiAlertOctagon/>
            Minimum OS version: {app.minOS}
          </li>
        )
      }

      {
        app.license && (
          <li>
            { app.licenseUrl && (
              <a href={app.licenseUrl} target="_blank"
                 rel="noopener noreferrer ugc">
                <FiFileText />
                License: {app.license}
              </a>
            )}

            {!app.licenseUrl && (
              <>
                <FiFileText />
                License: {app.license}
              </>
            )}
          </li>
        )
      }

      {
        app.tags && app.tags.length > 1 && (
         <li>
          <FiTag/>
          Tags
         </li>
        )
      }

    </>
  )
}

const Tags = ({ tags }) => {
  return (
    <div className={styles.tags}>
      <ul>
        {tags.map((tag, i) => (
          <li key={i}>
            <Link href={`/apps?q=tags: ${tag}`}>
              {tag}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

const ShareCard = ({ app, shareCardRef }) => {
  const [copyStatus, setCopyStatus] = useState('idle');
  const shareUrl = buildSiteUrl(`/apps/${app._id}`);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus('copied');
    } catch (error) {
      setCopyStatus('failed');
    }

    setTimeout(() => {
      setCopyStatus('idle');
    }, 5000);
  };

  const shareToTwitter = () => {
    const text = `Install ${app.name} instantly with winget.\nGet it on Winstall:\n${shareUrl}\n#winget #winstall`;
    const link = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(link, '_blank');
  };

  const shareToFacebook = () => {
    const quote = `Install ${app.name} instantly with winget.\nGet it on Winstall:\n${shareUrl}`;
    // const link = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(quote)}`;
    const link = `https://www.facebook.com/share.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(quote)}`;
    window.open(link, '_blank');
  };

  const shareToLinkedIn = () => {
    const quote = `Install ${app.name} instantly with winget.\nGet it on Winstall:\n${shareUrl}`;
    const link = `https://www.linkedin.com/shareArticle/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(quote)}&mini=true`;
    // const link = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(link, '_blank');
  };

  return (
    <div className={styles.shareCard} ref={shareCardRef}>
      <button onClick={shareToTwitter} className={styles.shareButton}>
        <FaXTwitter size={24} />
        <span>X (Twitter)</span>
      </button>
      <button onClick={shareToFacebook} className={styles.shareButton}>
        <FaFacebook size={24} color="#1877F2" />
        <span>Facebook</span>
      </button>
      <button onClick={shareToLinkedIn} className={styles.shareButton}>
        <FaLinkedin size={24} color="#0A66C2" />
        <span>LinkedIn</span>
      </button>
      <div className={styles.shareDivider} />
      <button
        onClick={handleCopyLink}
        className={`${styles.shareButton} ${copyStatus === 'failed' ? styles.shareButtonFailed : ''}`}
      >
        <IoIosLink size={24} />
        <span>
          {copyStatus === 'copied'
            ? 'Link copied'
            : copyStatus === 'failed'
              ? 'Copy failed'
              : 'Copy link'}
        </span>
      </button>
    </div>
  );
};

const Copy = ({ id, version, latestVersion }) => {
  const [showingCheck, setShowingCheck] = useState(false);

  let str = `winget install -e --id ${id}${version == latestVersion ? "" : ` -v "${version}"`}`;

  return (
    <div
      className={`${styles.copy} ${showingCheck ? styles.active : ""}`}
      onClick={() => {
        navigator.clipboard.writeText(str);
        setShowingCheck(true);
        setTimeout(() => {
          setShowingCheck(false);
        }, 2000);
      }}
    >
      <FiTerminal size={20} />
      {!showingCheck && (
        <>
          <span className={styles.installCommand}>{str}</span>
          <FiCopy className={styles.clipboard} size={16} />
        </>
      )}
      {showingCheck && (
        <>
          <span className={styles.copiedText}>Copied!</span>
          <FiCheckCircle className={styles.clipboard} size={16} />
        </>
      )}
    </div>
  );
};

export default SingleApp;
