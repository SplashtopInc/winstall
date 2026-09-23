import React, { useState, useEffect, useCallback, useRef } from "react";
import styles from "../styles/apps.module.scss";
import searchStyles from "../styles/search.module.scss";

import SingleApp from "../components/SingleApp";
import Footer from "../components/Footer";
import MetaTags from "../components/MetaTags";
import Search from "../components/Search";
import ShelfListSkeleton from "../components/shelfListSkeleton";

import { useRouter } from "next/router";
import fetchWinstallAPI from "../utils/fetchWinstallAPI";
import { getRevalidateTime } from "../utils/revalidateCache";
import { getIconBase } from "../utils/runtimeConfig";
import {
  parseAppsListQuery,
  appsListPath,
  listScopeKey,
  suggestionQueryFromListQuery,
} from "../utils/parsePublisherQuery";
import Error from "../components/Error";
import DonateCard from "../components/DonateCard";
import SearchEmptyState from "../components/SearchEmptyState";
import TrySearching from "../components/TrySearching";
import { useAppsTotal } from "../ctx/appsTotalContext";

export const PAGE_SIZE = 56;
export const SHELF_AD_INTERVAL = 15;

function normalizeAppsPayload(payload) {
  if (!payload) return { items: [], total: 0, totalKnown: false, offset: 0, limit: 0 };

  if (Array.isArray(payload)) {
    return {
      items: payload,
      total: payload.length,
      totalKnown: false,
      offset: 0,
      limit: payload.length,
    };
  }

  if (Array.isArray(payload.items)) {
    return {
      items: payload.items,
      total: typeof payload.total === "number" ? payload.total : payload.items.length,
      totalKnown: typeof payload.total === "number",
      offset: typeof payload.offset === "number" ? payload.offset : 0,
      limit: typeof payload.limit === "number" ? payload.limit : payload.items.length,
    };
  }

  if (Array.isArray(payload.apps)) {
    return {
      items: payload.apps,
      total: typeof payload.total === "number" ? payload.total : payload.apps.length,
      totalKnown: typeof payload.total === "number",
      offset: typeof payload.offset === "number" ? payload.offset : 0,
      limit: typeof payload.limit === "number" ? payload.limit : payload.apps.length,
    };
  }

  if (Array.isArray(payload.data)) {
    return {
      items: payload.data,
      total: typeof payload.total === "number" ? payload.total : payload.data.length,
      totalKnown: typeof payload.total === "number",
      offset: typeof payload.offset === "number" ? payload.offset : 0,
      limit: typeof payload.limit === "number" ? payload.limit : payload.data.length,
    };
  }

  return { items: [], total: 0, totalKnown: false, offset: 0, limit: 0 };
}

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

function pathHasSearchQuery(asPath, queryQ) {
  if (queryQ) return true;
  const path = String(asPath || "");
  const qIndex = path.indexOf("?");
  if (qIndex === -1) return false;
  return new URLSearchParams(path.slice(qIndex)).has("q");
}

function Store({ data, error, buildTime }) {
  const router = useRouter();
  const { setAppsTotal } = useAppsTotal();
  const initialNormalized = normalizeAppsPayload(data);
  const canHydrateList =
    !pathHasSearchQuery(router.asPath, router.query?.q) &&
    initialNormalized.items.length > 0;

  const [apps, setApps] = useState(() =>
    canHydrateList ? withIconUrls(initialNormalized.items) : []
  );
  const [searchInput, setSearchInput] = useState();
  const [total, setTotal] = useState(() =>
    canHydrateList ? initialNormalized.total : 0
  );
  const [totalKnown, setTotalKnown] = useState(() =>
    canHydrateList ? initialNormalized.totalKnown : false
  );
  const [nextOffset, setNextOffset] = useState(() =>
    canHydrateList
      ? initialNormalized.offset + initialNormalized.items.length
      : 0
  );
  const [clientError, setClientError] = useState("");
  const [loadedScope, setLoadedScope] = useState(() =>
    canHydrateList ? "list" : null
  );
  const [isLoading, setIsLoading] = useState(() => !canHydrateList);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const listSessionRef = useRef(canHydrateList);

  const queryFromRouter = Array.isArray(router.query?.q)
    ? router.query.q[0]
    : router.query?.q;
  const queryText =
    searchInput !== undefined && searchInput !== null
      ? searchInput
      : queryFromRouter || "";
  const listQuery = parseAppsListQuery(queryText);
  const hasActiveQuery = listQuery.kind !== "list";
  const currentScope = listScopeKey(listQuery);
  const listReady = loadedScope === currentScope;
  const showLoadMore =
    listReady &&
    !isLoading &&
    !clientError &&
    totalKnown &&
    total > 0 &&
    apps.length < total;

  const loadApps = useCallback(async ({ parsed, offset, append }) => {
    const listQueryArg =
      parsed && parsed.kind ? parsed : parseAppsListQuery(parsed);
    setClientError("");

    const { response, error: fetchError } = await fetchWinstallAPI(
      appsListPath(listQueryArg, { offset, limit: PAGE_SIZE })
    );

    if (fetchError) {
      if (!append) {
        setApps([]);
        setTotal(0);
        setTotalKnown(false);
        setNextOffset(0);
        setLoadedScope(listScopeKey(listQueryArg));
      }
      setClientError(fetchError);
      return { ok: false };
    }

    const normalized = normalizeAppsPayload(response);
    if (normalized.items.length) {
      withIconUrls(normalized.items);
    }

    setApps((prev) =>
      append ? [...prev, ...normalized.items] : normalized.items
    );
    setTotal(normalized.total);
    setTotalKnown(normalized.totalKnown);
    setNextOffset(normalized.offset + normalized.items.length);
    setLoadedScope(listScopeKey(listQueryArg));
    return { ok: true };
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.page == null && router.query.offset == null) return;

    const nextQuery = {};
    if (router.query.q) nextQuery.q = router.query.q;
    router.replace(
      { pathname: "/apps", query: nextQuery },
      undefined,
      { shallow: true }
    );
  }, [
    router,
    router.isReady,
    router.query.offset,
    router.query.page,
    router.query.q,
  ]);

  // Bare catalog total feeds the global nav search hint (same Context as home).
  useEffect(() => {
    if (listQuery.kind !== "list") return;
    if (!totalKnown || !(total > 0)) return;
    setAppsTotal(total);
  }, [listQuery.kind, totalKnown, total, setAppsTotal]);

  useEffect(() => {
    if (!router.isReady) return;

    let cancelled = false;
    const qRaw =
      searchInput !== undefined && searchInput !== null
        ? searchInput
        : router.query?.q;
    const q = Array.isArray(qRaw) ? qRaw[0] : qRaw || "";
    const scopeQuery = parseAppsListQuery(q);

    async function loadFirstBatch() {
      if (scopeQuery.kind === "list") {
        if (listSessionRef.current) {
          setIsLoading(false);
          return;
        }

        const normalized = normalizeAppsPayload(data);
        if (normalized.items.length && !buildTime) {
          withIconUrls(normalized.items);
          if (cancelled) return;
          listSessionRef.current = true;
          setApps(normalized.items);
          setTotal(normalized.total);
          setTotalKnown(normalized.totalKnown);
          setNextOffset(normalized.offset + normalized.items.length);
          setLoadedScope("list");
          setIsLoading(false);
          setIsLoadingMore(false);
          setClientError("");
          return;
        }
      } else {
        listSessionRef.current = false;
      }

      setIsLoading(true);
      setIsLoadingMore(false);
      setClientError("");
      setApps([]);
      setTotal(0);
      setTotalKnown(false);
      setNextOffset(0);

      const result = await loadApps({
        parsed: scopeQuery,
        offset: 0,
        append: false,
      });

      if (cancelled) return;
      if (result.ok && scopeQuery.kind === "list") {
        listSessionRef.current = true;
      }
      setIsLoading(false);
    }

    loadFirstBatch();

    return () => {
      cancelled = true;
    };
    // currentScope drives reloads; q is read from the same render as scope
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, currentScope, loadApps]);

  const handleSearch = (q) => {
    setSearchInput(q);
  };

  const handleLoadMore = async () => {
    if (isLoading || isLoadingMore || !showLoadMore) return;

    setIsLoadingMore(true);
    await loadApps({
      parsed: listQuery,
      offset: nextOffset,
      append: true,
    });
    setIsLoadingMore(false);
  };

  const Title = () => (
    <>
      {!queryText && (
        <h1>
          All apps
          {totalKnown ? ` (${total.toLocaleString()})` : ""}
        </h1>
      )}
      {queryText && <h1>Search results for &quot;{queryText}&quot;</h1>}
    </>
  );

  if (error) return <Error detail={error} />;
  if (clientError) return <Error detail={clientError} />;

  const gridClassName = `${styles.all} ${styles.storeList}`;
  const showSkeleton = isLoading && apps.length === 0;
  const showEmptySearch =
    listReady && !isLoading && hasActiveQuery && apps.length === 0;
  const showEmptyList =
    listReady && !isLoading && !hasActiveQuery && apps.length === 0;

  return (
    <div className={styles.page}>
      <MetaTags title="Apps - winstall" path="/apps" />

      <div className={styles.controls}>
        <Title />
      </div>

      <Search
        onSearch={handleSearch}
        label={"Search for apps"}
        placeholder={"Search apps..."}
        hideInput={Boolean(queryFromRouter)}
        asGlobalTrigger={!queryFromRouter}
      />

      {showSkeleton ? (
        <ShelfListSkeleton
          variant="app"
          gridClassName={gridClassName}
          label="Loading apps"
        />
      ) : showEmptySearch ? (
        <div className={searchStyles.emptyWrap}>
          <SearchEmptyState query={queryText} />
          <TrySearching
            query={suggestionQueryFromListQuery(queryText)}
            className={searchStyles.suggestions}
          />
        </div>
      ) : showEmptyList ? (
        <p className={styles.status}>No apps to show</p>
      ) : apps.length > 0 ? (
        <>
          <ul className={gridClassName}>
            {apps.map((app, index) => (
              <React.Fragment
                key={app._id || app.id || app.packageId || app.name}
              >
                <SingleApp app={app} showSelectCheckbox />

                {index % SHELF_AD_INTERVAL === 0 && (
                  <DonateCard addMargin="" placement="apps-list" />
                )}
              </React.Fragment>
            ))}
          </ul>

          {showLoadMore && (
            <div className={styles.loadMoreWrap}>
              <button
                type="button"
                className={styles.loadMore}
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      ) : null}

      <Footer />
    </div>
  );
}

export async function getStaticProps() {
  const { getPublicApiBase } = require("../utils/runtimeConfig");

  if (!getPublicApiBase()) {
    console.warn(
      "[getStaticProps /apps] Build-time: no API configured, will trigger ISR on first request"
    );
    return {
      props: {
        data: null,
        error: null,
        buildTime: true,
      },
      revalidate: 1,
    };
  }

  let { response, error } = await fetchWinstallAPI(
    `/apps?offset=0&limit=${PAGE_SIZE}`
  );

  const items = normalizeAppsPayload(response).items;
  const hasData = items.length > 0;

  if (!hasData) {
    const revalidate = getRevalidateTime("apps", false);
    console.warn(
      `[getStaticProps /apps] Runtime: no data, will retry in ${revalidate}s`
    );
    return {
      props: {
        data: null,
        error: error || "Failed to load apps from API server",
      },
      revalidate,
    };
  }

  const revalidate = getRevalidateTime("apps", true);
  console.log(
    `[getStaticProps /apps] Success: ${items.length} apps, revalidate in ${revalidate}s`
  );

  return {
    props: {
      data: response ?? null,
    },
    revalidate,
  };
}

export default Store;
