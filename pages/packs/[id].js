import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react";
import {
  FiDownload,
  FiPlus,
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiShare2,
} from "react-icons/fi";

import PageWrapper from "../../components/PageWrapper";
import MetaTags from "../../components/MetaTags";
import Error from "../../components/Error";
import PackDetailAppCard from "../../components/PackDetailAppCard";
import InstallDrawer from "../../components/InstallDrawer";
import CreatePackModal from "../../components/CreatePackModal";
import AppSettingsDrawer from "../../components/AppSettingsDrawer";
import AddAppsDialog from "../../components/AddAppsDialog";
import useDefaultInstallFilters from "../../hooks/useDefaultInstallFilters";
import Toast from "../../components/Toast";
import useRequireAuth from "../../hooks/useRequireAuth";
import { copyPack, deletePack, fetchPackById, updatePack } from "../../utils/fetchPackAPI";
import {
  formatAppsForPatch,
  invalidateOwnPacksCache,
  isAppUnavailable,
  mergeAppsWithEnrichedData,
  removeAppFromPack,
  syncOwnPacksCacheEntry,
} from "../../utils/packHelpers";
import fetchWinstallAPI from "../../utils/fetchWinstallAPI";
import { compareVersion } from "../../utils/helpers";

import styles from "../../styles/packDetail.module.scss";

function getApiBase() {
  return process.env.NEXT_PUBLIC_WINSTALL_API_BASE || "";
}

function transformPackIcons(pack, apiBase) {
  const base = apiBase || getApiBase();
  if (!pack) return pack;

  return {
    ...pack,
    apps: (pack.apps || []).map((app) => {
      if (app.icon && !app.icon.startsWith("http") && !app.iconUrl) {
        const iconName = app.icon.replace(".png", "");
        return {
          ...app,
          iconUrl: `${base}/icons/next/${iconName}.webp`,
          iconPng: `${base}/icons/${iconName}.png`,
        };
      }
      return app;
    }),
  };
}

function formatCreatedDate(isoDate) {
  if (!isoDate) return "—";
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

async function enrichApps(apps) {
  if (!apps?.length) return [];

  const enriched = await Promise.all(
    apps.map(async (app) => {
      const appId = app.appId || app._id;
      if (!appId) return app;

      const { response, status, error } = await fetchWinstallAPI(`/apps/${appId}`);

      if (isAppUnavailable({ response, status, error })) {
        return { ...app, _id: appId, unavailable: true };
      }

      if (!response) return app;

      const appData = response?.data && !response._id ? response.data : response;

      let versions = appData.versions ?? app.versions ?? [];
      if (versions.length > 1) {
        versions = [...versions].sort((a, b) =>
          compareVersion(b.version, a.version)
        );
      }

      const latestVersion =
        versions[0]?.version ??
        appData.latestVersion ??
        app.latestVersion ??
        app.appVersion ??
        "";
      const savedVersion = app.appVersion || app.latestVersion || latestVersion;
      const selectedVersion = versions.some((entry) => entry.version === savedVersion)
        ? savedVersion
        : latestVersion;

      return {
        ...app,
        _id: appId,
        unavailable: false,
        desc: appData.desc ?? app.desc,
        updatedAt: appData.updatedAt ?? app.updatedAt,
        latestVersion,
        versions,
        appVersion: selectedVersion,
        likeCount: appData.likeCount ?? appData.likes ?? app.likeCount,
        publisher: appData.publisher ?? app.publisher,
        selectedVersion,
      };
    })
  );

  return enriched;
}

export default function PackDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [pack, setPack] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [installDrawerOpen, setInstallDrawerOpen] = useState(false);
  const [copying, setCopying] = useState(false);
  const [toast, setToast] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingPack, setEditingPack] = useState(null);
  const [deletingPack, setDeletingPack] = useState(false);
  const [deletingAppId, setDeletingAppId] = useState(null);
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);
  const [selectedAppForSettings, setSelectedAppForSettings] = useState(null);
  const [addAppsDialogOpen, setAddAppsDialogOpen] = useState(false);
  const defaultFilters = useDefaultInstallFilters(settingsDrawerOpen);
  const menuRef = useRef(null);
  const persistAppsTimerRef = useRef(null);

  const isOwner = Boolean(user && pack && user.id === pack.userId);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const loadPack = useCallback(async (packId) => {
    setLoading(true);
    setError(null);

    const { response, error: fetchError } = await fetchPackById(packId);

    if (fetchError) {
      setError(fetchError);
      setPack(null);
      setApps([]);
      setLoading(false);
      return;
    }

    const apiBase = getApiBase();
    const transformed = transformPackIcons(response, apiBase);
    setPack(transformed);
    setApps(transformed.apps || []);
    setLoading(false);

    const enriched = await enrichApps(transformed.apps || []);
    setApps(enriched);
  }, []);

  useEffect(() => {
    if (!id || typeof id !== "string") return;

    let cancelled = false;

    async function init() {
      const session = await getSession();
      if (!cancelled && session?.user) {
        setUser(session.user);
      }

      await loadPack(id);
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [id, loadPack]);

  const handleCopySuccess = useCallback(async () => {
    if (!id || copying) return;

    setCopying(true);

    const { response, error: copyError } = await copyPack(id);

    setCopying(false);

    if (copyError) {
      setToast({ type: "error", message: copyError });
      return;
    }

    invalidateOwnPacksCache();
    setToast({
      type: "success",
      message: `Added "${response?.name || pack?.name}" to your packs.`,
    });
  }, [id, copying, pack?.name]);

  const { requireAuth: requireAuthForCopy } = useRequireAuth({
    resumeKey: "copyPack",
    onSuccess: handleCopySuccess,
    callbackUrl: router.asPath,
  });

  const handleEditClick = () => {
    setMenuOpen(false);
    setEditingPack(pack);
  };

  const handleDeleteClick = async () => {
    setMenuOpen(false);

    if (deletingPack) return;

    if ("confirm" in window && typeof window.confirm === "function") {
      if (!window.confirm("Are you sure you want to delete this pack?")) {
        return;
      }
    }

    setDeletingPack(true);

    const { response, error: deleteError } = await deletePack(pack._id);

    setDeletingPack(false);

    if (deleteError) {
      setToast({ type: "error", message: deleteError });
      return;
    }

    if (response) {
      invalidateOwnPacksCache();
      setToast({ type: "success", message: "Pack deleted." });
      router.push("/packs?tab=mine");
    }
  };

  const handlePackUpdated = (updatedPack) => {
    const apiBase = getApiBase();
    const transformed = transformPackIcons(updatedPack, apiBase);
    setPack((current) => ({
      ...current,
      ...transformed,
      apps: mergeAppsWithEnrichedData(current?.apps, transformed.apps ?? []),
    }));
    setApps((current) =>
      mergeAppsWithEnrichedData(current, transformed.apps ?? [])
    );
    setEditingPack(null);
    syncOwnPacksCacheEntry(transformed);
    setToast({ type: "success", message: "Pack updated." });
  };

  const persistPackApps = useCallback(async (nextApps) => {
    if (!pack?._id) return;

    const { response, error: persistError } = await updatePack(pack._id, {
      apps: formatAppsForPatch(nextApps),
    });

    if (persistError) {
      setToast({ type: "error", message: persistError });
      return;
    }

    if (response) {
      const apiBase = getApiBase();
      const transformed = transformPackIcons(response, apiBase);
      setPack((current) => ({
        ...current,
        ...transformed,
        apps: mergeAppsWithEnrichedData(current?.apps, transformed.apps),
      }));
      setApps((currentApps) =>
        mergeAppsWithEnrichedData(currentApps, transformed.apps)
      );
      syncOwnPacksCacheEntry(transformed);
    }
  }, [pack?._id]);

  const handleAppSettings = (app) => {
    const appFromPack = apps.find((item) => item._id === app._id) || app;
    setSelectedAppForSettings(appFromPack);
    setSettingsDrawerOpen(true);
  };

  const handleCloseSettingsDrawer = () => {
    setSettingsDrawerOpen(false);
    setSelectedAppForSettings(null);
  };

  const handleVersionChange = (app, nextVersion) => {
    if (!isOwner || !nextVersion) return;

    let nextApps = [];

    setApps((current) => {
      nextApps = current.map((item) => {
        if (item._id !== app._id) return item;

        return {
          ...item,
          appVersion: nextVersion,
          selectedVersion: nextVersion,
        };
      });
      return nextApps;
    });

    setPack((current) => {
      if (!current) return current;
      return { ...current, apps: nextApps };
    });

    if (persistAppsTimerRef.current) {
      clearTimeout(persistAppsTimerRef.current);
    }

    persistAppsTimerRef.current = setTimeout(() => {
      persistPackApps(nextApps);
    }, 500);
  };

  const handleAppConfigChange = (app, installOptions) => {
    let nextApps = [];

    setApps((current) => {
      nextApps = current.map((item) => {
        if (item._id !== app._id) return item;

        const nextApp = { ...item };
        if (installOptions && Object.keys(installOptions).length > 0) {
          nextApp.installOptions = installOptions;
        } else {
          delete nextApp.installOptions;
        }
        return nextApp;
      });
      return nextApps;
    });

    setPack((current) => {
      if (!current) return current;
      return { ...current, apps: nextApps };
    });

    setSelectedAppForSettings((prevApp) => {
      if (!prevApp || prevApp._id !== app._id) return prevApp;

      const nextApp = { ...prevApp };
      if (installOptions && Object.keys(installOptions).length > 0) {
        nextApp.installOptions = installOptions;
      } else {
        delete nextApp.installOptions;
      }
      return nextApp;
    });

    if (persistAppsTimerRef.current) {
      clearTimeout(persistAppsTimerRef.current);
    }

    persistAppsTimerRef.current = setTimeout(() => {
      persistPackApps(nextApps);
    }, 500);
  };

  const handleAppsAdded = async (updatedPack) => {
    if (!updatedPack) return;

    const apiBase = getApiBase();
    const transformed = transformPackIcons(updatedPack, apiBase);
    setPack((current) => ({
      ...current,
      ...transformed,
      apps: transformed.apps ?? current.apps,
    }));

    const enriched = await enrichApps(transformed.apps || []);
    setApps(enriched);
    syncOwnPacksCacheEntry(transformed);
    setToast({ type: "success", message: "Apps added to pack." });
  };

  const handleDeleteApp = async (appId) => {
    if (deletingAppId || !pack?._id) return;

    if ("confirm" in window && typeof window.confirm === "function") {
      if (!window.confirm("Remove this app from the pack?")) {
        return;
      }
    }

    setDeletingAppId(appId);

    const { response, error: deleteError } = await removeAppFromPack(
      pack._id,
      apps,
      appId
    );

    setDeletingAppId(null);

    if (deleteError) {
      setToast({ type: "error", message: deleteError });
      return;
    }

    if (response) {
      const apiBase = getApiBase();
      const transformed = transformPackIcons(response, apiBase);
      setPack((current) => ({
        ...current,
        ...transformed,
        apps: transformed.apps ?? current.apps,
      }));

      const enriched = await enrichApps(transformed.apps || []);
      setApps(enriched);
      syncOwnPacksCacheEntry(transformed);
      setToast({ type: "success", message: "App removed from pack." });
    }
  };

  if (!router.isReady || loading) {
    return (
      <PageWrapper>
        <div className={styles.page}>
          <p className={styles.loading}>Loading...</p>
        </div>
      </PageWrapper>
    );
  }

  if (error || !pack) {
    return (
      <PageWrapper>
        <Error
          title="Sorry! We could not load this pack."
          subtitle={
            error ||
            "This pack could not be loaded. It may not exist or you may not have access."
          }
        />
      </PageWrapper>
    );
  }

  const appCount = apps.length;
  const installableApps = apps
    .filter((app) => !app.unavailable)
    .map((app) => ({
      ...app,
      selectedVersion:
        app.selectedVersion || app.appVersion || app.latestVersion,
    }));
  const metaDesc =
    appCount > 0
      ? `${pack.description} Includes ${apps
          .slice(0, 3)
          .map((app) => app.name)
          .join(", ")}${appCount > 3 ? ", and more" : ""}.`
      : pack.description;

  return (
    <PageWrapper>
      <MetaTags
        title={`${pack.name} - winstall`}
        desc={metaDesc}
        path={`/packs/${pack._id}`}
      />

      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerMain}>
            <h1 className={styles.title}>{pack.name}</h1>
            <p className={styles.description}>{pack.description}</p>
            <div className={styles.badges}>
              <span className={styles.badge}>
                {appCount} {appCount === 1 ? "app" : "apps"}
              </span>
              <span className={styles.badge}>
                Created {formatCreatedDate(pack.createdAt)}
              </span>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.installButton}
              disabled={installableApps.length === 0}
              onClick={() => setInstallDrawerOpen(true)}
            >
              <FiDownload aria-hidden="true" />
              Install
            </button>

            {isOwner ? (
              <>
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={() => setAddAppsDialogOpen(true)}
                >
                  <FiPlus aria-hidden="true" />
                  Add App
                </button>
                <div className={styles.packMenuWrapper} ref={menuRef}>
                  <button
                    type="button"
                    className={styles.packMenu}
                    aria-label="Pack options"
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((open) => !open)}
                  >
                    <FiMoreVertical aria-hidden="true" />
                  </button>
                  {menuOpen && (
                    <div className={styles.packMenuDropdown}>
                      <button
                        type="button"
                        className={styles.packMenuItem}
                        onClick={handleEditClick}
                      >
                        <FiEdit aria-hidden="true" /> Edit
                      </button>
                      <button
                        type="button"
                        className={styles.packMenuItem}
                        disabled={deletingPack}
                        onClick={handleDeleteClick}
                      >
                        <FiTrash2 aria-hidden="true" />{" "}
                        {deletingPack ? "Deleting..." : "Delete"}
                      </button>
                      <button
                        type="button"
                        className={styles.packMenuItem}
                        disabled
                      >
                        <FiShare2 aria-hidden="true" /> Share
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                type="button"
                className={styles.actionButton}
                disabled={copying}
                onClick={() => requireAuthForCopy()}
              >
                <FiPlus aria-hidden="true" />
                {copying ? "Adding..." : "Add to my packs"}
              </button>
            )}
          </div>
        </header>

        {appCount === 0 ? (
          <p className={styles.emptyApps}>This pack has no apps yet.</p>
        ) : (
          <ul className={styles.appGrid}>
            {apps.map((app) => (
              <li key={app._id}>
                <PackDetailAppCard
                  app={app}
                  isOwner={isOwner}
                  deleting={deletingAppId === app._id}
                  onConfig={handleAppSettings}
                  onDelete={handleDeleteApp}
                  onVersionChange={isOwner ? handleVersionChange : undefined}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <InstallDrawer
        apps={installableApps}
        isOpen={installDrawerOpen}
        onClose={() => setInstallDrawerOpen(false)}
      />

      {user && (
        <CreatePackModal
          isOpen={!!editingPack}
          pack={editingPack}
          onClose={() => setEditingPack(null)}
          user={user}
          onCreated={handlePackUpdated}
        />
      )}

      <AppSettingsDrawer
        app={selectedAppForSettings}
        isOpen={settingsDrawerOpen}
        onClose={handleCloseSettingsDrawer}
        onConfigChange={handleAppConfigChange}
        defaultFilters={defaultFilters}
      />

      <AddAppsDialog
        isOpen={addAppsDialogOpen}
        onClose={() => setAddAppsDialogOpen(false)}
        pack={pack}
        packApps={apps}
        onAppsAdded={handleAppsAdded}
      />

      <Toast
        message={toast?.message}
        type={toast?.type}
        onDismiss={() => setToast(null)}
      />
    </PageWrapper>
  );
}
