import { useState, useEffect, useCallback, useRef } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiArrowLeftCircle,
  FiArrowRightCircle,
  FiTrash,
  FiPlus,
  FiSearch,
  FiHelpCircle,
} from "react-icons/fi";

import AddAppPickerCard from "./AddAppPickerCard";
import { ListSort, applySort } from "./ListSort";
import fetchWinstallAPI from "../utils/fetchWinstallAPI";
import { addAppsToPack } from "../utils/packHelpers";
import dialogStyles from "../styles/addAppsDialog.module.scss";
import searchStyles from "../styles/search.module.scss";

const APPS_PER_PAGE = 60;

function getApiBase() {
  return process.env.NEXT_PUBLIC_WINSTALL_API_BASE || "";
}

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
  const base = getApiBase();
  apps.forEach((app) => {
    if (app.icon && !app.icon.startsWith("http") && !app.iconUrl) {
      const iconName = app.icon.replace(".png", "");
      app.iconUrl = `${base}/icons/next/${iconName}.webp`;
      app.iconPng = `${base}/icons/${iconName}.png`;
    }
  });
  return apps;
}

function getAppId(app) {
  return app?.appId || app?._id;
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
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasSearchResponse, setHasSearchResponse] = useState(false);
  const [showSearching, setShowSearching] = useState(false);
  const [sort, setSort] = useState("update-desc");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalKnown, setTotalKnown] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [loadedPage, setLoadedPage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [clientError, setClientError] = useState("");
  const [selectedApps, setSelectedApps] = useState([]);
  const [adding, setAdding] = useState(false);
  const contentRef = useRef(null);
  const activeSearchRequestRef = useRef(0);
  const hideSearchingTimerRef = useRef(null);

  const isSearching = Boolean(searchInput && searchInput.length >= 3);
  const totalPages = totalKnown ? Math.ceil(total / APPS_PER_PAGE) : 0;
  const packAppIds = new Set(packApps.map(getAppId).filter(Boolean));
  const hasSelection = selectedApps.length > 0;
  const displayApps = isSearching ? searchResults : apps;
  const listLoading = isSearching ? searchLoading : isLoading;

  const resetState = useCallback(() => {
    setSearchInput("");
    setSearchResults([]);
    setSearchLoading(false);
    setHasSearchResponse(false);
    setShowSearching(false);
    setSort("update-desc");
    setPage(1);
    setSelectedApps([]);
    setClientError("");
    setLoadedPage(null);
  }, []);

  const loadPage = useCallback(async (targetPage, sortOrder = "update-desc") => {
    const offset = (targetPage - 1) * APPS_PER_PAGE;
    setIsLoading(true);
    setClientError("");

    const { response, error: fetchError } = await fetchWinstallAPI(
      `/apps?offset=${offset}&limit=${APPS_PER_PAGE}`
    );

    setIsLoading(false);

    if (fetchError) {
      setClientError(fetchError);
      return;
    }

    const normalized = normalizeAppsPayload(response);
    const items = [...normalized.items];
    if (items.length) {
      applySort(items, sortOrder);
      transformAppIcons(items);
    }

    setApps(items);
    setTotal(normalized.total);
    setTotalKnown(normalized.totalKnown);
    setCurrentOffset(normalized.offset);
    setLoadedPage(targetPage);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    resetState();
    loadPage(1, "update-desc");
  }, [isOpen, resetState, loadPage]);

  useEffect(() => {
    if (!isOpen || isSearching) return;
    if (loadedPage === page) return;
    loadPage(page, sort);
  }, [isOpen, isSearching, page, loadedPage, loadPage, sort]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (!searchInput) {
      setSearchResults([]);
      setHasSearchResponse(false);
      setSearchLoading(false);
      setShowSearching(false);
      return;
    }

    const timer = setTimeout(() => {
      runSearch(searchInput);
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput, isOpen]);

  useEffect(() => {
    const canSearch = isSearching;

    if (!canSearch) {
      if (hideSearchingTimerRef.current) {
        clearTimeout(hideSearchingTimerRef.current);
        hideSearchingTimerRef.current = null;
      }
      setShowSearching(false);
      return;
    }

    if (searchLoading) {
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
  }, [searchLoading, isSearching]);

  const runSearch = async (inputVal) => {
    if (!inputVal || inputVal.length < 3) {
      setSearchResults([]);
      setHasSearchResponse(false);
      setSearchLoading(false);
      return;
    }

    const query = inputVal.trim();
    const requestId = activeSearchRequestRef.current + 1;
    activeSearchRequestRef.current = requestId;

    setSearchResults([]);
    setHasSearchResponse(false);
    setSearchLoading(true);

    const { response, error } = await fetchWinstallAPI(
      `/apps/search?q=${encodeURIComponent(query)}&limit=${APPS_PER_PAGE}`
    );

    if (requestId !== activeSearchRequestRef.current) return;

    setSearchLoading(false);
    setHasSearchResponse(true);

    if (error) {
      setSearchResults([]);
      return;
    }

    const normalized = normalizeAppsPayload(response);
    const items = [...normalized.items];
    transformAppIcons(items);
    setSearchResults(items.slice(0, APPS_PER_PAGE));
  };

  const handleClose = () => {
    if (adding) return;
    onClose?.();
  };

  const handleSort = (sortOrder) => {
    setSort(sortOrder);
    const sorted = [...apps];
    applySort(sorted, sortOrder);
    setApps(sorted);
  };

  const handleNext = () => {
    contentRef.current?.scrollTo(0, 0);
    setPage((current) => current + 1);
  };

  const handlePrevious = () => {
    contentRef.current?.scrollTo(0, 0);
    setPage((current) => Math.max(1, current - 1));
  };

  useEffect(() => {
    if (!isOpen || isSearching) return;

    const canGoPrevious = page > 1;
    const canGoNext = totalKnown
      ? page < totalPages
      : apps.length === APPS_PER_PAGE;

    const handlePagination = (event) => {
      const target = event.target;
      if (
        isLoading ||
        (target instanceof HTMLElement &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.tagName === "SELECT" ||
            target.isContentEditable))
      ) {
        return;
      }

      if (event.key === "ArrowRight" || event.keyCode === 39) {
        if (!canGoNext) return;
        event.preventDefault();
        handleNext();
      } else if (event.key === "ArrowLeft" || event.keyCode === 37) {
        if (!canGoPrevious) return;
        event.preventDefault();
        handlePrevious();
      }
    };

    document.addEventListener("keydown", handlePagination);
    return () => document.removeEventListener("keydown", handlePagination);
  }, [
    isOpen,
    isSearching,
    isLoading,
    page,
    totalKnown,
    totalPages,
    apps.length,
  ]);

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

  const Pagination = ({ small, disable }) => (
    <div className={small ? dialogStyles.minPagination : dialogStyles.pagbtn}>
      <button
        type="button"
        className={`button ${small ? dialogStyles.smallBtn : ""}`}
        onClick={handlePrevious}
        title="Previous page of apps"
        disabled={page > 1 ? (disable ? "disabled" : undefined) : "disabled"}
      >
        <FiChevronLeft />
        {!small ? "Previous" : ""}
      </button>
      <button
        type="button"
        className={`button ${small ? dialogStyles.smallBtn : ""}`}
        title="Next page of apps"
        onClick={handleNext}
        disabled={
          totalKnown
            ? page < totalPages
              ? disable
                ? "disabled"
                : undefined
              : "disabled"
            : apps.length === APPS_PER_PAGE
            ? disable
              ? "disabled"
              : undefined
            : "disabled"
        }
      >
        {!small ? "Next" : ""}
        <FiChevronRight />
      </button>
    </div>
  );

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

        <div className={dialogStyles.searchSection}>
          <label htmlFor="add-apps-search" className={searchStyles.searchLabel}>
            Search for apps
          </label>
          <div className={searchStyles.searchBox}>
            <div className={searchStyles.searchInner}>
              <FiSearch />
              <input
                type="text"
                id="add-apps-search"
                minLength={2}
                value={searchInput}
                autoComplete="off"
                placeholder="Enter you search term here"
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </div>
            <div className={searchStyles.tip}>
              <a href="#" title="Search tips" onClick={(event) => event.preventDefault()}>
                <FiHelpCircle />
              </a>
              <div className={searchStyles.tipData}>
                <p>Use search prefixes to target a specific field in searches!</p>
                <ul>
                  <li>
                    <code>name:</code> search for an app&apos;s name
                  </li>
                  <li>
                    <code>publisher:</code> search for apps by a publisher
                  </li>
                  <li>
                    <code>tags:</code> search for apps by a tag
                  </li>
                  <li>
                    <code>desc:</code> search the description of apps
                  </li>
                </ul>
              </div>
            </div>
            {showSearching && (
              <span className={searchStyles.searchingLabel}>Searching...</span>
            )}
          </div>
        </div>

        {!isSearching && (
          <div className={dialogStyles.topControls}>
            <Pagination small />
          </div>
        )}

        {!isSearching && (
          <div className={dialogStyles.controls}>
            <p>
              {isLoading
                ? "Loading apps..."
                : apps.length === 0
                ? "No apps to show"
                : totalKnown
                ? `Showing ${currentOffset + 1}-${currentOffset + apps.length} of ${total.toLocaleString()} apps (page ${page} of ${totalPages}).`
                : `Showing ${currentOffset + 1}-${currentOffset + apps.length} apps (page ${page}).`}
            </p>
            <ListSort apps={apps} defaultSort={sort} onSort={handleSort} />
          </div>
        )}

        <div
          ref={contentRef}
          className={`${dialogStyles.content} ${hasSelection ? dialogStyles.hasSelectionBar : ""}`}
        >
          {clientError && <p className={dialogStyles.error}>{clientError}</p>}

          {!clientError && listLoading && displayApps.length === 0 && (
            <p className={dialogStyles.loading}>
              {isSearching ? "Searching..." : "Loading apps..."}
            </p>
          )}

          {!clientError &&
            isSearching &&
            !searchLoading &&
            hasSearchResponse &&
            searchResults.length === 0 && (
              <p className={dialogStyles.empty}>Could not find any apps.</p>
            )}

          {!clientError && displayApps.length > 0 && (
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
          )}

          {!clientError &&
            !isSearching &&
            !isLoading &&
            displayApps.length === 0 && (
              <p className={dialogStyles.empty}>No apps to show.</p>
            )}
        </div>

        {!isSearching && (
          <div className={dialogStyles.pagination}>
            <Pagination />
            <em>
              Hit the <FiArrowLeftCircle /> and <FiArrowRightCircle /> keys on
              your keyboard to navigate between pages quickly.
            </em>
          </div>
        )}

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
