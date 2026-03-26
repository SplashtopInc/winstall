import { useState, useEffect } from "react";
import styles from "../styles/search.module.scss";

import SingleApp from "../components/SingleApp";
import ListPackages from "../components/ListPackages";
import fetchWinstallAPI from "../utils/fetchWinstallAPI";

import { FiSearch, FiHelpCircle } from "react-icons/fi";
import { useRouter } from "next/router";

function Search({ onSearch, label, placeholder, preventGlobalSelect, isPackView, alreadySelected=[], limit=-1}) {
  const [results, setResults] = useState([])
  const [searchInput, setSearchInput] = useState("");
  const router = useRouter();
  const [urlQuery, setUrlQuery] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [apiBase, setApiBase] = useState("");

  const normalizeAppsPayload = (payload) => {
    if (!payload?.data) return [];
    return payload.data;
  };

  useEffect(() => {
    // Fetch API base URL once for client-side icon transformation
    fetch('/api/runtime-config')
      .then(res => res.json())
      .then(config => setApiBase(config.apiBase))
      .catch(() => setApiBase(''));
  }, []);

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
    }
  })

  useEffect(() => {
    if (searchInput === undefined || searchInput === null) return;
    const timer = setTimeout(() => {
      handleSearch(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSearch = async (inputVal) => {
    if(onSearch) onSearch(inputVal);

    if(inputVal === ""){
      setSearchInput("");
      setResults([]);
      return;
    }

    if (inputVal.length < 3) return;

    const query = inputVal.trim();
    const resultLimit = limit && limit > 0 ? limit : 60;

    setIsLoading(true);
    const { response, error } = await fetchWinstallAPI(
      `/apps/search?q=${encodeURIComponent(query)}&limit=${resultLimit}`
    );
    setIsLoading(false);

    if (error) {
      setResults([]);
      return;
    }

    const items = normalizeAppsPayload(response);

    // Transform icons to full URLs for search results
    if (apiBase) {
      items.forEach(app => {
        if (app.icon && !app.icon.startsWith('http') && !app.iconUrl) {
          const iconName = app.icon.replace('.png', '');
          app.iconUrl = `${apiBase}/icons/next/${iconName}.webp`;
          app.iconPng = `${apiBase}/icons/${iconName}.png`;
        }
      });
    }

    setResults(items.slice(0, resultLimit));
  };

  return (
    <div>
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

      {searchInput && results.length !== 0 ? (
        <ListPackages>
            {results.map((app, i) =>
            <SingleApp
              app={app}
              showDesc={true}
              preventGlobalSelect={preventGlobalSelect}
              pack={isPackView}
              hideBorder={true}
              key={`${app._id}`}
              preSelected={alreadySelected.findIndex(a => a._id === app._id) != -1 ? true : false}
            />
          )}
        </ListPackages>
      ) : (
          <>
            {searchInput && !isLoading ? (
              <p className={styles.noresults}>Could not find any apps.</p>
            ) : ""}
          </>
        )}
    </div>
  );
}

export default Search;
