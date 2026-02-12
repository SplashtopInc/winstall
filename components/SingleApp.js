import {useState, useContext, useEffect} from "react";
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


import AppIcon from "./AppIcon";
import { compareVersion, timeAgo } from "../utils/helpers";


let SingleApp = ({ app, all, onVersionChange = false, large = false, showTime = false, pack = false, displaySelect = false, preventGlobalSelect, hideBorder=false, preSelected=false, initialVersion}) => {
  const [selected, setSelected] = useState(false);
  const { selectedApps, setSelectedApps } = useContext(SelectedContext);
  const router = useRouter();

  // Sort versions if available
  if (app.versions && app.versions.length > 1) {
    app.versions = app.versions.sort((a, b) =>
      compareVersion(b.version, a.version)
    );
    // make sure latest version is sorted
    app.latestVersion = app.versions[0].version;
  }

  // Get initial version from prop (passed from URL path) or use latestVersion
  const getInitialVersion = () => {
    if (large && initialVersion && app.versions) {
      const isValidVersion = app.versions.some(v => v.version === initialVersion);
      if (isValidVersion) {
        return initialVersion;
      }
    }
    return app.latestVersion;
  };

  const [version, setVersion] = useState(getInitialVersion());

  // Update version when initialVersion prop changes (e.g., navigation between versions)
  useEffect(() => {
    if (large && initialVersion && app.versions) {
      const isValidVersion = app.versions.some(v => v.version === initialVersion);
      if (isValidVersion && initialVersion !== version) {
        setVersion(initialVersion);
        app.selectedVersion = initialVersion;
      }
    }
  }, [initialVersion, large, app.versions]);

  if (!app.selectedVersion) app.selectedVersion = version;

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

      if (all) {
        app = all.find((i) => app._id == i._id);
        setSelectedApps([...selectedApps, app]);
      } else {
        setSelectedApps([...selectedApps, app]);
      }
    }

  };


  if (!app && !app.img || !app.name) return <></>;

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
            const newVersion = e.target.value;
            setVersion(newVersion);
            app.selectedVersion = newVersion;

            // Update URL with version path (only in large/detail mode)
            if (large) {
              const newPath = newVersion === app.latestVersion 
                ? `/apps/${app._id}` 
                : `/apps/${app._id}/${newVersion}`;
              router.replace(newPath, undefined, { shallow: true });
            }

            if (selected) {
              let found = selectedApps.find((a) => a._id === app._id);
              found.selectedVersion = newVersion;

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

  const handleShare = () => {
    const versionPath = version !== app.latestVersion ? `/${encodeURIComponent(version)}` : '';
    const link = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Checkout ${app.name} by ${app.publisher} on @winstallHQ:`)}&url=${encodeURIComponent(`https://winstall.app/apps/${app._id}${versionPath}`)}`

    window.open(link)
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
              <AppIcon id={app._id} name={app.name} icon={app.icon} />
              Install {app.name} with winget
            </>
          ) : (
            <Link href="/apps/[id]" as={`/apps/${app._id}`} prefetch={false}>
              <a>
                <AppIcon id={app._id} name={app.name} icon={app.icon} />
                <p>{app.name}</p>
              </a>
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
                <a>
                  v{app.selectedVersion}
                </a>
              </Link>
            )}
          </li>
        )}

        <li>
          <Link href={`/apps?q=${`publisher: ${app.publisher}`}`}>
            <a>
              <FiUser />
              Other apps by {app.publisher}
            </a>
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
              <a>
                <FiCode />
                Source code for winget package
              </a>
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
              {app.versions[0].installerType
                ? `(.${app.versions[0].installerType.toLowerCase()})`
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
          <button className={`button ${styles.shareApp}`} onClick={handleShare}>
            <FiShare2 />
            Share
          </button>
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
              <a>{tag}</a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

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
