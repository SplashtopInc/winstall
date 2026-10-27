import { useCallback, useEffect, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";

import Error from "../../components/Error";
import { LoginButtons } from "../../components/LoginPanel";
import MetaTags from "../../components/MetaTags";
import PackCard from "../../components/PackCard";
import PageWrapper from "../../components/PageWrapper";
import ShelfListSkeleton from "../../components/shelfListSkeleton";
import SingleApp from "../../components/SingleApp";
import { getDocumentShellStaticProps } from "../../utils/documentShellStaticProps";
import fetchWinstallAPI from "../../utils/fetchWinstallAPI";
import { setLastLoginProvider } from "../../utils/lastLoginProvider";
import { getIconBase } from "../../utils/runtimeConfig";
import styles from "../../styles/myFavorites.module.scss";
import packStyles from "../../styles/packsIndex.module.scss";

const LIKED_PAGE_LIMIT = 24;

function withIconUrls(items) {
  items.forEach((app) => {
    if (app.icon && !app.icon.startsWith("http") && !app.iconUrl) {
      const iconName = app.icon.replace(".png", "");
      app.iconUrl = `${getIconBase()}/icons/next/${iconName}.webp`;
      app.iconPng = `${getIconBase()}/icons/${iconName}.png`;
    }
  });
  return items;
}

function transformPackIcons(packs) {
  const base = getIconBase();
  if (!base || !packs) return packs || [];

  return packs.map((pack) => ({
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
  }));
}

function readEnvelope(response) {
  const data = Array.isArray(response?.data) ? response.data : [];
  const total = typeof response?.total === "number" ? response.total : data.length;
  return { data, total };
}

function likedPath(kind, offset) {
  return `/${kind}/liked?offset=${offset}&limit=${LIKED_PAGE_LIMIT}`;
}

export default function MyFavoritesPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const userId = session?.user?.id;
  const sessionReady = sessionStatus !== "loading";
  const authError = router.query.error;

  const [tab, setTab] = useState("apps");
  const [apps, setApps] = useState([]);
  const [packs, setPacks] = useState([]);
  const [appsTotal, setAppsTotal] = useState(0);
  const [packsTotal, setPacksTotal] = useState(0);
  const [appsError, setAppsError] = useState("");
  const [packsError, setPacksError] = useState("");
  const [appsLoaded, setAppsLoaded] = useState(false);
  const [packsLoaded, setPacksLoaded] = useState(false);
  const [appsLoadingMore, setAppsLoadingMore] = useState(false);
  const [packsLoadingMore, setPacksLoadingMore] = useState(false);
  const requestGen = useRef(0);

  const clearLists = useCallback(() => {
    setApps([]);
    setPacks([]);
    setAppsTotal(0);
    setPacksTotal(0);
    setAppsError("");
    setPacksError("");
    setAppsLoaded(false);
    setPacksLoaded(false);
    setAppsLoadingMore(false);
    setPacksLoadingMore(false);
  }, []);

  const reload = useCallback(async () => {
    const gen = ++requestGen.current;
    clearLists();

    const [appsResult, packsResult] = await Promise.all([
      fetchWinstallAPI(likedPath("apps", 0)),
      fetchWinstallAPI(likedPath("packs", 0)),
    ]);

    if (gen !== requestGen.current) return;

    if (appsResult.error || !appsResult.response) {
      setAppsError(appsResult.error || "Could not load apps.");
    } else {
      const normalized = readEnvelope(appsResult.response);
      setApps(withIconUrls(normalized.data));
      setAppsTotal(normalized.total);
    }
    setAppsLoaded(true);

    if (packsResult.error || !packsResult.response) {
      setPacksError(packsResult.error || "Could not load packs.");
    } else {
      const normalized = readEnvelope(packsResult.response);
      setPacks(transformPackIcons(normalized.data));
      setPacksTotal(normalized.total);
    }
    setPacksLoaded(true);
  }, [clearLists]);

  useEffect(() => {
    if (!sessionReady) return undefined;

    if (!userId) {
      clearLists();
      return undefined;
    }

    reload();
    return () => {
      requestGen.current += 1;
    };
  }, [sessionReady, userId, reload, clearLists]);

  useEffect(() => {
    // bfcache restores this document without remounting.
    const handlePageShow = (event) => {
      if (!event.persisted || !userId) return;
      reload();
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [reload, userId]);

  const loadMore = async (kind) => {
    const gen = requestGen.current;
    const offset = kind === "apps" ? apps.length : packs.length;
    if (kind === "apps") setAppsLoadingMore(true);
    else setPacksLoadingMore(true);

    const { response, error } = await fetchWinstallAPI(likedPath(kind, offset));
    if (gen !== requestGen.current) return;

    if (kind === "apps") setAppsLoadingMore(false);
    else setPacksLoadingMore(false);

    if (error || !response) {
      const message = error || "Could not load the next page.";
      if (kind === "apps") setAppsError(message);
      else setPacksError(message);
      return;
    }

    const normalized = readEnvelope(response);
    if (kind === "apps") {
      setApps((current) => current.concat(withIconUrls(normalized.data)));
      setAppsTotal(normalized.total);
      return;
    }

    setPacks((current) => current.concat(transformPackIcons(normalized.data)));
    setPacksTotal(normalized.total);
  };

  const handleLogin = (provider) => {
    setLastLoginProvider(provider);
    signIn(provider, { callbackUrl: "/my/favorites" });
  };

  const renderList = () => {
    const isApps = tab === "apps";
    const items = isApps ? apps : packs;
    const total = isApps ? appsTotal : packsTotal;
    const error = isApps ? appsError : packsError;
    const loaded = isApps ? appsLoaded : packsLoaded;
    const loadingMore = isApps ? appsLoadingMore : packsLoadingMore;

    if (!loaded) {
      return (
        <ShelfListSkeleton
          variant={isApps ? "app" : "pack"}
          gridClassName={packStyles.grid}
          label={isApps ? "Loading apps" : "Loading packs"}
        />
      );
    }

    if (error) {
      return <Error detail={error} />;
    }

    if (total === 0) {
      return (
        <div className={packStyles.emptyState}>
          <h2 className={packStyles.emptyTitle}>
            {isApps ? "No apps yet" : "No packs yet"}
          </h2>
          <p className={packStyles.emptyDescription}>
            {isApps
              ? "Like an app from its page. It will show up here."
              : "Like a pack from its page. It will show up here."}
          </p>
          <Link
            href={isApps ? "/category" : "/packs"}
            className={`button accent ${styles.browse}`}
          >
            {isApps ? "Browse apps" : "Browse packs"}
          </Link>
        </div>
      );
    }

    const showLoadMore = items.length > 0 && items.length < total;

    return (
      <>
        <ul className={packStyles.grid}>
          {isApps
            ? items.map((app) => (
                <SingleApp key={app._id} app={app} showSelectCheckbox />
              ))
            : items.map((pack) => (
                <li key={pack._id}>
                  <PackCard
                    pack={pack}
                    showVisibility={pack.visibility === "private"}
                  />
                </li>
              ))}
        </ul>
        {showLoadMore && (
          <div className={packStyles.loadMoreWrap}>
            <button
              type="button"
              className={packStyles.loadMore}
              onClick={() => loadMore(isApps ? "apps" : "packs")}
              disabled={loadingMore}
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <PageWrapper>
      <MetaTags
        title="Favorites"
        desc="Your favorite apps and packs."
        path="/my/favorites"
      />
      <Head>
        <meta name="robots" content="noindex" />
      </Head>

      <div className={packStyles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Favorites</h1>
          <p className={styles.lead}>Your favorite apps and packs.</p>
        </header>

        {!sessionReady && (
          <ShelfListSkeleton
            variant="app"
            gridClassName={packStyles.grid}
            label="Loading apps"
          />
        )}

        {sessionReady && !userId && (
          <section className={packStyles.signInSection}>
            <h2 className={packStyles.signInTitle}>
              Sign in to see your favorite apps and packs.
            </h2>
            {authError && (
              <p className={packStyles.authError}>
                Authentication failed. Please try again.
              </p>
            )}
            <LoginButtons
              onLogin={handleLogin}
              className={packStyles.loginButtons}
              cardClassName={packStyles.loginCard}
            />
          </section>
        )}

        {sessionReady && userId && (
          <>
            <div className={packStyles.tabs} role="tablist" aria-label="Favorites">
              <button
                type="button"
                role="tab"
                id="liked-tab-apps"
                aria-selected={tab === "apps"}
                aria-controls="liked-panel"
                className={`${packStyles.tab} ${
                  tab === "apps" ? packStyles.tabActive : ""
                }`}
                onClick={() => setTab("apps")}
              >
                Apps
                {appsLoaded && !appsError && (
                  <span className={styles.tabCount}>{appsTotal}</span>
                )}
              </button>
              <button
                type="button"
                role="tab"
                id="liked-tab-packs"
                aria-selected={tab === "packs"}
                aria-controls="liked-panel"
                className={`${packStyles.tab} ${
                  tab === "packs" ? packStyles.tabActive : ""
                }`}
                onClick={() => setTab("packs")}
              >
                Packs
                {packsLoaded && !packsError && (
                  <span className={styles.tabCount}>{packsTotal}</span>
                )}
              </button>
            </div>
            <div
              role="tabpanel"
              id="liked-panel"
              aria-labelledby={
                tab === "apps" ? "liked-tab-apps" : "liked-tab-packs"
              }
            >
              {renderList()}
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
}

export async function getStaticProps() {
  return getDocumentShellStaticProps();
}
