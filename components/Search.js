import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { FiSearch, FiHelpCircle } from "react-icons/fi";

import styles from "../styles/search.module.scss";

import SingleApp from "../components/SingleApp";
import ListPackages from "../components/ListPackages";
import TrySearching from "../components/TrySearching";
import fetchWinstallAPI from "../utils/fetchWinstallAPI";
import { useSearchDialog } from "../ctx/SearchDialogContext";

function suggestionQueryFromSearch(input) {
  const q = String(input || "").trim();
  if (!q) return "";

  const publisherMatch = q.match(/^publisher:\s*(.+)$/i);
  if (publisherMatch) return publisherMatch[1].trim();

  const prefixMatch = q.match(/^(name|tags|desc):\s*(.+)$/i);
  if (prefixMatch) return prefixMatch[2].trim();

  return q;
}

function Search({ onSearch, label, placeholder, preventGlobalSelect, isPackView, alreadySelected=[], limit=-1, hideInput=false, onEmptyChange, asGlobalTrigger=false}) {
  const router = useRouter();
  const { openSearch } = useSearchDialog();
  const [results, setResults] = useState([])
  const [searchInput, setSearchInput] = useState("");
  const [urlQuery, setUrlQuery] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [showSearching, setShowSearching] = useState(false);
  const [hasSearchResponse, setHasSearchResponse] = useState(false);
  const activeRequestIdRef = useRef(0);
  const hideSearchingTimerRef = useRef(null);

  const normalizeAppsPayload = (payload) => {
    if (!payload) return [];
    // Handle direct array response (e.g., from /publishers/:id)
    if (Array.isArray(payload)) return payload;
    // Handle object with data property
    if (payload.data) return payload.data;
    return [];
  };

  useEffect(() => {
    // if we have a ?q param on the url, we deal with it
    if (router.isReady && router.query && router.query.q && urlQuery !== router.query.q){
      setSearchInput(router.query.q);
      setUrlQuery(router.query.q)
    } else if(results != 0 && urlQuery && router.query && !router.query.q){
      // if we previously had a query, going back should reset it.
      setSearchInput("");
      setResults([]);
      if(onSearch) onSearch();
      if(onEmptyChange) onEmptyChange(false);
    }
  })

  useEffect(() => {
    if (searchInput === undefined || searchInput === null) return;
    const timer = setTimeout(() => {
      handleSearch(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const canSearch = !!searchInput && searchInput.trim().length > 0;

    if (!canSearch) {
      if (hideSearchingTimerRef.current) {
        clearTimeout(hideSearchingTimerRef.current);
        hideSearchingTimerRef.current = null;
      }
      setShowSearching(false);
      return;
    }

    if (isLoading) {
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
  }, [isLoading, searchInput]);

  const handleSearch = async (inputVal) => {
    if(inputVal === ""){
      if(onSearch) onSearch("");
      if(onEmptyChange) onEmptyChange(false);
      setSearchInput("");
      setResults([]);
      setHasSearchResponse(false);
      setIsLoading(false);
      return;
    }

    const query = inputVal.trim();
    if (!query) {
      if(onSearch) onSearch("");
      if(onEmptyChange) onEmptyChange(false);
      setResults([]);
      setHasSearchResponse(false);
      setIsLoading(false);
      return;
    }

    const resultLimit = limit && limit > 0 ? limit : 60;

    if (onSearch) onSearch(query);
    if (onEmptyChange) onEmptyChange(false);

    const requestId = activeRequestIdRef.current + 1;
    activeRequestIdRef.current = requestId;

    setResults([]);
    setHasSearchResponse(false);
    setIsLoading(true);

    // Parse field-specific search prefixes
    const publisherMatch = query.match(/^publisher:\s*(.+)$/i);
    let searchUrl;

    if (publisherMatch) {
      // Use dedicated publisher endpoint
      const publisherName = publisherMatch[1].trim();
      searchUrl = `/publishers/${encodeURIComponent(publisherName)}?limit=${resultLimit}`;
    } else {
      // Check for other field prefixes (name:, tags:, desc:)
      const prefixMatch = query.match(/^(name|tags|desc):\s*(.+)$/i);

      if (prefixMatch) {
        const field = prefixMatch[1].toLowerCase();
        const value = prefixMatch[2].trim();
        searchUrl = `/apps/search?q=${encodeURIComponent(value)}&${field}=${encodeURIComponent(value)}&limit=${resultLimit}`;
      } else {
        searchUrl = `/apps/search?q=${encodeURIComponent(query)}&limit=${resultLimit}`;
      }
    }

    const { response, error } = await fetchWinstallAPI(searchUrl);

    if (requestId !== activeRequestIdRef.current) return;

    setIsLoading(false);
    setHasSearchResponse(true);

    if (error) {
      setResults([]);
      if (onEmptyChange) onEmptyChange(true);
      return;
    }

    const items = normalizeAppsPayload(response);

    // Transform icons to full URLs for search results
    items.forEach(app => {
      if (app.icon && !app.icon.startsWith('http') && !app.iconUrl) {
        const iconName = app.icon.replace('.png', '');
        app.iconUrl = `${process.env.NEXT_PUBLIC_WINSTALL_API_BASE}/icons/next/${iconName}.webp`;
        app.iconPng = `${process.env.NEXT_PUBLIC_WINSTALL_API_BASE}/icons/${iconName}.png`;
      }
    });

    const nextResults = items.slice(0, resultLimit);
    setResults(nextResults);
    if (onEmptyChange) onEmptyChange(nextResults.length === 0);
  };

  return (
    <div>
      {asGlobalTrigger && (
        <>
          <label className={styles.searchLabel}>{label || "Search for apps"}</label>
          <button
            type="button"
            className={`${styles.searchBox} ${styles.searchTriggerBox}`}
            onClick={openSearch}
            aria-label={label || "Search for apps"}
          >
            <div className={styles.searchInner}>
              <FiSearch />
              <span className={styles.triggerPlaceholder}>
                {placeholder || "Search for apps here"}
              </span>
            </div>
          </button>
        </>
      )}

      {!hideInput && !asGlobalTrigger && (
        <>
          <label htmlFor="search" className={styles.searchLabel}>{label || "Search for apps"}</label>
          <div className={styles.searchBox}>
            <div className={styles.searchInner}>
              <FiSearch />

              <input
                type="text"
                minLength={2}
                onChange={(e) => setSearchInput(e.target.value)}
                id="search"
                value={searchInput}
                autoComplete="off"
                autoFocus={true}
                placeholder={placeholder || "Search for apps here"}
              />
            </div>

            <div className={styles.tip}>
              <a href="#" title="Search tips"><FiHelpCircle /></a>
              <div className={styles.tipData}>
                <p>Use search prefixes to target a specific field in searches!</p>
                <ul>
                  <li><code>name:</code> search for an app's name</li>
                  <li><code>publisher:</code> search for apps by a publisher</li>
                  <li><code>tags:</code> search for apps by a tag</li>
                  <li><code>desc:</code> search the description of apps</li>
                </ul>
              </div>
            </div>
            {showSearching && (
              <span className={styles.searchingLabel}>Searching...</span>
            )}
            {searchInput && results.length === limit &&
              <p className={styles.searchHint}>
                Showing {results.length} result
                {results.length > 1 && "s"}
                . {results.length == limit &&
                  <a href={`/apps?q=${searchInput}`}>More</a>
                }
              </p>
            }
          </div>
        </>
      )}

      {hideInput && showSearching && (
        <p className={styles.searchingLabelStandalone}>Searching...</p>
      )}

      {searchInput && !isLoading && hasSearchResponse && results.length !== 0 ? (
        <ListPackages>
            {results.map((app, i) =>
            <SingleApp
              app={app}
              showDesc={true}
              preventGlobalSelect={preventGlobalSelect}
              pack={isPackView}
              hideBorder={true}
              showSelectCheckbox
              key={`${app._id}`}
              preSelected={alreadySelected.findIndex(a => a._id === app._id) != -1 ? true : false}
            />
          )}
        </ListPackages>
      ) : (
          <>
            {searchInput && !isLoading && hasSearchResponse && results.length === 0 && searchInput.trim() ? (
              <div className={styles.emptyWrap}>
                {hideInput ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon} aria-hidden="true">
                      <img
                        src="/assets/search_empty.svg"
                        alt=""
                        width={32}
                        height={32}
                        draggable={false}
                      />
                    </div>
                    <h2 className={styles.emptyTitle}>
                      No apps found for "<span className={styles.emptyQuery}>{searchInput}</span>"
                    </h2>
                    <p className={styles.emptyDesc}>
                      We couldn't find any apps matching your search. Try a different keyword or browse these suggestions.
                    </p>
                  </div>
                ) : (
                  <p className={styles.noresults}>Could not find any apps.</p>
                )}
                <TrySearching
                  query={suggestionQueryFromSearch(searchInput)}
                  className={styles.suggestions}
                />
              </div>
            ) : ""}
          </>
        )}
    </div>
  );
}

export default Search;
