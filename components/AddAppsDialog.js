import { useState, useEffect, useCallback, useRef } from "react";
import { FiTrash, FiPlus, FiSearch } from "react-icons/fi";

import AddAppPickerCard from "./AddAppPickerCard";
import CategoryFilterSelect from "./categoryFilterSelect";
import fetchWinstallAPI from "../utils/fetchWinstallAPI";
import { fetchCategoryApps } from "../utils/fetchCategoryApps";
import { addAppsToPack } from "../utils/packHelpers";
import { getIconBase } from "../utils/runtimeConfig";
import { CATEGORY_LABELS, CATEGORY_SLUGS } from "../utils/categoryMeta";
import {
  parseAppsListQuery,
  appsListPath,
  listScopeKey,
} from "../utils/parsePublisherQuery";
import dialogStyles from "../styles/addAppsDialog.module.scss";
import searchStyles from "../styles/search.module.scss";

const PAGE_SIZE = 56;
const DEFAULT_CATEGORY = "all";

const CATEGORIES = CATEGORY_SLUGS.map((slug) => ({
  slug,
  label: CATEGORY_LABELS[slug] || slug,
}));

function normalizeAppsPayload(payload) {
  if (!payload) {
    return { items: [], total: 0, totalKnown: false, offset: 0, limit: 0 };
  }

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

function transformAppIcons(apps) {
  const base = getIconBase();
  return apps.map((app) => {
    if (app.icon && !app.icon.startsWith("http") && !app.iconUrl) {
      const iconName = app.icon.replace(".png", "");
      return {
        ...app,
        iconUrl: `${base}/icons/next/${iconName}.webp`,
        iconPng: `${base}/icons/${iconName}.png`,
      };
    }
    return app;
  });
}

function getAppId(app) {
  return app?.appId || app?._id;
}

function categoryScopeKey(slug) {
  return `category:${slug}`;
}

export default function AddAppsDialog({
  isOpen,
  onClose,
  pack,
  packApps = [],
  onAppsAdded,
}) {
  const [apps, setApps] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");
  const [showSearching, setShowSearching] = useState(false);
  const [activeSlug, setActiveSlug] = useState(DEFAULT_CATEGORY);
  const [total, setTotal] = useState(0);
  const [totalKnown, setTotalKnown] = useState(false);
  const [nextOffset, setNextOffset] = useState(0);
  const [lastBatchFull, setLastBatchFull] = useState(false);
  const [loadedScope, setLoadedScope] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [clientError, setClientError] = useState("");
  const [selectedApps, setSelectedApps] = useState([]);
  const [adding, setAdding] = useState(false);
  const contentRef = useRef(null);
  const hideSearchingTimerRef = useRef(null);
  const loadGenerationRef = useRef(0);

  const parsedInput = parseAppsListQuery(searchInput);
  const isPublisherMode = parsedInput.kind === "publisher";
  const isKeywordSearch =
    parsedInput.kind === "search" && searchInput.trim().length >= 3;
  const searchPending =
    isKeywordSearch && committedSearch !== searchInput.trim();
  const hasSearchOverlay =
    isPublisherMode || (isKeywordSearch && Boolean(committedSearch));
  const searchQuery = isPublisherMode
    ? parsedInput
    : hasSearchOverlay
    ? parseAppsListQuery(committedSearch)
    : null;
  const currentScope = hasSearchOverlay
    ? listScopeKey(searchQuery)
    : categoryScopeKey(activeSlug);
  const packAppIds = new Set(packApps.map(getAppId).filter(Boolean));
  const hasSelection = selectedApps.length > 0;
  const displayApps =
    searchPending || loadedScope !== currentScope ? [] : apps;
  const listLoading = searchPending || isLoading;
  const showLoadMore =
    !clientError &&
    !listLoading &&
    !searchPending &&
    displayApps.length > 0 &&
    (totalKnown ? displayApps.length < total : lastBatchFull);

  const resetState = useCallback(() => {
    setSearchInput("");
    setCommittedSearch("");
    setShowSearching(false);
    setActiveSlug(DEFAULT_CATEGORY);
    setSelectedApps([]);
    setClientError("");
    setApps([]);
    setTotal(0);
    setTotalKnown(false);
    setNextOffset(0);
    setLastBatchFull(false);
    setLoadedScope("");
    setIsLoading(false);
    setIsLoadingMore(false);
  }, []);

  const loadCategoryFirstPage = useCallback(async (slug) => {
    const generation = ++loadGenerationRef.current;
    const scope = categoryScopeKey(slug);
    setIsLoading(true);
    setIsLoadingMore(false);
    setClientError("");
    setApps([]);
    setTotal(0);
    setTotalKnown(false);
    setNextOffset(0);
    setLastBatchFull(false);

    const result = await fetchCategoryApps({
      slug,
      offset: 0,
      limit: PAGE_SIZE,
    });

    if (generation !== loadGenerationRef.current) return;

    if (result.error) {
      setApps([]);
      setTotal(0);
      setTotalKnown(false);
      setNextOffset(0);
      setLastBatchFull(false);
      setLoadedScope(scope);
      setClientError(result.error);
      setIsLoading(false);
      return;
    }

    setApps(result.items);
    setTotal(result.total);
    setTotalKnown(true);
    setNextOffset(result.offset + result.items.length);
    setLastBatchFull(result.items.length === PAGE_SIZE);
    setLoadedScope(scope);
    setClientError("");
    setIsLoading(false);
  }, []);

  const loadSearchFirstPage = useCallback(async (parsed) => {
    const generation = ++loadGenerationRef.current;
    const scope = listScopeKey(parsed);
    setIsLoading(true);
    setIsLoadingMore(false);
    setClientError("");
    setApps([]);
    setTotal(0);
    setTotalKnown(false);
    setNextOffset(0);
    setLastBatchFull(false);

    const { response, error: fetchError } = await fetchWinstallAPI(
      appsListPath(parsed, { offset: 0, limit: PAGE_SIZE })
    );

    if (generation !== loadGenerationRef.current) return;

    setIsLoading(false);

    if (fetchError) {
      setApps([]);
      setTotal(0);
      setTotalKnown(false);
      setNextOffset(0);
      setLastBatchFull(false);
      setLoadedScope(scope);
      setClientError(fetchError);
      return;
    }

    const normalized = normalizeAppsPayload(response);
    const items = transformAppIcons([...normalized.items]);
    setApps(items);
    setTotal(normalized.total);
    setTotalKnown(normalized.totalKnown);
    setNextOffset(normalized.offset + items.length);
    setLastBatchFull(items.length === PAGE_SIZE);
    setLoadedScope(scope);
    setClientError("");
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    resetState();
  }, [isOpen, resetState]);

  useEffect(() => {
    if (!isOpen) return;
    if (!isKeywordSearch) {
      setCommittedSearch("");
      return;
    }

    const timer = setTimeout(() => {
      setCommittedSearch(searchInput.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [isOpen, isKeywordSearch, searchInput]);

  useEffect(() => {
    if (!isOpen || searchPending) return;
    if (loadedScope === currentScope) return;

    if (hasSearchOverlay) {
      const parsed = isPublisherMode
        ? parseAppsListQuery(searchInput)
        : parseAppsListQuery(committedSearch);
      loadSearchFirstPage(parsed);
      return;
    }

    loadCategoryFirstPage(activeSlug);
  }, [
    isOpen,
    searchPending,
    currentScope,
    loadedScope,
    hasSearchOverlay,
    isPublisherMode,
    searchInput,
    committedSearch,
    activeSlug,
    loadSearchFirstPage,
    loadCategoryFirstPage,
  ]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    const canSearch = isKeywordSearch || isPublisherMode;

    if (!canSearch) {
      if (hideSearchingTimerRef.current) {
        clearTimeout(hideSearchingTimerRef.current);
        hideSearchingTimerRef.current = null;
      }
      setShowSearching(false);
      return;
    }

    if (searchPending || isLoading) {
      if (hideSearchingTimerRef.current) {
        clearTimeout(hideSearchingTimerRef.current);
        hideSearchingTimerRef.current = null;
      }
      setShowSearching(true);
      return;
    }

    hideSearchingTimerRef.current = setTimeout(() => {
      setShowSearching(false);
      hideSearchingTimerRef.current = null;
    }, 300);

    return () => {
      if (hideSearchingTimerRef.current) {
        clearTimeout(hideSearchingTimerRef.current);
        hideSearchingTimerRef.current = null;
      }
    };
  }, [isLoading, isKeywordSearch, isPublisherMode, searchPending]);

  const handleClose = () => {
    if (adding) return;
    onClose?.();
  };

  const handleSelectCategory = (slug) => {
    if (slug === activeSlug && !hasSearchOverlay && !searchInput.trim()) {
      return;
    }
    setSearchInput("");
    setCommittedSearch("");
    setShowSearching(false);
    setActiveSlug(slug);
    setLoadedScope("");
  };

  const handleLoadMore = async () => {
    if (isLoading || isLoadingMore) return;
    if (totalKnown ? displayApps.length >= total : !lastBatchFull) return;

    setIsLoadingMore(true);
    const generation = loadGenerationRef.current;

    if (hasSearchOverlay && searchQuery) {
      const { response, error: fetchError } = await fetchWinstallAPI(
        appsListPath(searchQuery, { offset: nextOffset, limit: PAGE_SIZE })
      );

      if (generation !== loadGenerationRef.current) return;

      if (fetchError) {
        setIsLoadingMore(false);
        return;
      }

      const normalized = normalizeAppsPayload(response);
      const items = transformAppIcons([...normalized.items]);
      setApps((prev) => [...prev, ...items]);
      if (normalized.totalKnown) {
        setTotal(normalized.total);
        setTotalKnown(true);
      }
      setNextOffset(normalized.offset + items.length);
      setLastBatchFull(items.length === PAGE_SIZE);
      setIsLoadingMore(false);
      return;
    }

    const result = await fetchCategoryApps({
      slug: activeSlug,
      offset: nextOffset,
      limit: PAGE_SIZE,
    });

    if (generation !== loadGenerationRef.current) return;

    if (result.error) {
      setIsLoadingMore(false);
      return;
    }

    setApps((prev) => [...prev, ...result.items]);
    setTotal(result.total);
    setTotalKnown(true);
    setNextOffset(result.offset + result.items.length);
    setLastBatchFull(result.items.length === PAGE_SIZE);
    setIsLoadingMore(false);
  };

  const isAppInPack = (app) => packAppIds.has(getAppId(app));

  const isAppSelected = (app) =>
    selectedApps.some((item) => getAppId(item) === getAppId(app));

  const handleToggleApp = (app) => {
    if (isAppInPack(app)) return;

    setSelectedApps((current) => {
      const id = getAppId(app);
      const exists = current.some((item) => getAppId(item) === id);
      if (exists) {
        return current.filter((item) => getAppId(item) !== id);
      }
      return [...current, { ...app, selectedVersion: app.latestVersion }];
    });
  };

  const handleClearSelection = () => {
    if ("confirm" in window && typeof window.confirm === "function") {
      if (!window.confirm("Are you sure you want to unselect all the apps?")) {
        return;
      }
    }
    setSelectedApps([]);
  };

  const handleAddToPack = async () => {
    if (!pack?._id || !selectedApps.length || adding) return;

    setAdding(true);

    const { response, error } = await addAppsToPack(
      pack._id,
      packApps,
      selectedApps
    );

    setAdding(false);

    if (error) {
      setClientError(error);
      return;
    }

    setSelectedApps([]);
    onAppsAdded?.(response);
    onClose?.();
  };

  const emptyMessage = hasSearchOverlay
    ? "Could not find any apps."
    : "No apps to show.";

  return (
    <>
      <div
        className={`${dialogStyles.overlay} ${isOpen ? dialogStyles.open : ""}`}
        onClick={handleClose}
        aria-hidden="true"
      />
      <div
        className={`${dialogStyles.dialog} ${isOpen ? dialogStyles.open : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-apps-dialog-title"
      >
        <header className={dialogStyles.header}>
          <button
            type="button"
            className={dialogStyles.closeButton}
            onClick={handleClose}
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M13 1L1 13" />
            </svg>
          </button>
          <h2 id="add-apps-dialog-title">
            Add Apps to &apos;{pack?.name || "Pack"}&apos;
          </h2>
        </header>

        <div className={dialogStyles.topControls}>
          <div className={dialogStyles.searchSection}>
            <label htmlFor="add-apps-search" className={searchStyles.searchLabel}>
              Search for apps
            </label>
            <div className={`${searchStyles.searchBox} ${dialogStyles.searchBoxFull}`}>
              <div className={searchStyles.searchInner}>
                <FiSearch />
                <input
                  type="text"
                  id="add-apps-search"
                  minLength={2}
                  value={searchInput}
                  autoComplete="off"
                  placeholder="Enter your search term here"
                  aria-label="Search for apps"
                  onChange={(event) => setSearchInput(event.target.value)}
                />
              </div>
              {showSearching && (
                <span className={searchStyles.searchingLabel}>Searching...</span>
              )}
            </div>
          </div>
          <CategoryFilterSelect
            categories={CATEGORIES}
            activeSlug={hasSearchOverlay ? DEFAULT_CATEGORY : activeSlug}
            onSelect={handleSelectCategory}
          />
        </div>

        <div
          ref={contentRef}
          className={`${dialogStyles.content} ${hasSelection ? dialogStyles.hasSelectionBar : ""}`}
        >
          {clientError && <p className={dialogStyles.error}>{clientError}</p>}

          {!clientError && listLoading && displayApps.length === 0 && (
            <p className={dialogStyles.loading}>
              {hasSearchOverlay || isKeywordSearch
                ? "Searching..."
                : "Loading apps..."}
            </p>
          )}

          {!clientError &&
            !listLoading &&
            displayApps.length === 0 && (
              <p className={dialogStyles.empty}>{emptyMessage}</p>
            )}

          {!clientError && displayApps.length > 0 && (
            <>
              <ul className={dialogStyles.grid}>
                {displayApps.map((app) => (
                  <li key={app._id}>
                    <AddAppPickerCard
                      app={app}
                      selected={isAppSelected(app)}
                      alreadyAdded={isAppInPack(app)}
                      onToggle={handleToggleApp}
                    />
                  </li>
                ))}
              </ul>

              {showLoadMore && (
                <div className={dialogStyles.loadMoreWrap}>
                  <button
                    type="button"
                    className={dialogStyles.loadMore}
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? "Loading…" : "Load more"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {hasSelection && (
          <div className={dialogStyles.selectionBar}>
            <div className={dialogStyles.inner}>
              <p>
                Selected {selectedApps.length}{" "}
                {selectedApps.length === 1 ? "app" : "apps"} so far
              </p>
              <div className={dialogStyles.selectionBarControls}>
                <button
                  type="button"
                  className={dialogStyles.clearButton}
                  onClick={handleClearSelection}
                  title="Clear selections"
                  disabled={adding}
                >
                  <FiTrash />
                </button>
                <button
                  type="button"
                  className={dialogStyles.addButton}
                  onClick={handleAddToPack}
                  disabled={adding}
                >
                  <FiPlus aria-hidden="true" />
                  {adding ? "Adding..." : "Add to Pack"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
