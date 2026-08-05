import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { FiSearch, FiX, FiChevronRight, FiArrowRight, FiClock } from "react-icons/fi";

import AppIcon from "./AppIcon";
import fetchWinstallAPI from "../utils/fetchWinstallAPI";
import {
  addRecentApp,
  addRecentQuery,
  getRecentSearches,
} from "../utils/recentSearches";
import styles from "../styles/searchDialog.module.scss";

const DEBOUNCE_MS = 250;

function highlightMatch(text, query) {
  if (!text || !query) return text;

  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      <mark>{text.slice(index, index + query.length)}</mark>
      {text.slice(index + query.length)}
    </>
  );
}

function SearchDialog({ isOpen, onClose }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const requestIdRef = useRef(0);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (!isOpen) return;

    setRecentItems(getRecentSearches());
    setActiveIndex(-1);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const trimmed = query.trim();

    if (!trimmed) {
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }

    const requestId = ++requestIdRef.current;
    const timer = setTimeout(async () => {
      const { response, error } = await fetchWinstallAPI(
        `/apps/suggest?q=${encodeURIComponent(trimmed)}`
      );

      if (requestId !== requestIdRef.current) return;

      if (error || !response) {
        setSuggestions([]);
        setActiveIndex(-1);
        return;
      }

      const items = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];

      setSuggestions(items);
      setActiveIndex(-1);
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [query, isOpen]);

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;

    const activeItem = listRef.current.querySelector(
      `[data-index="${activeIndex}"]`
    );
    activeItem?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const resetAndClose = () => {
    setQuery("");
    setSuggestions([]);
    setActiveIndex(-1);
    onClose();
  };

  const goToResults = () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setRecentItems(addRecentQuery(trimmed));
    resetAndClose();
    router.push(`/apps?q=${encodeURIComponent(trimmed)}`);
  };

  const goToApp = (item) => {
    if (!item?.id) return;

    setRecentItems(
      addRecentApp({
        id: item.id,
        name: item.name || item.id,
        icon: item.icon || "",
      })
    );
    resetAndClose();
    router.push(`/apps/${item.id}`);
  };

  const handleRecentClick = (item) => {
    if (item.type === "app") {
      goToApp(item);
      return;
    }

    setQuery(item.text || "");
    inputRef.current?.focus();
  };

  const handleOverlayMouseDown = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const moveActiveIndex = (direction) => {
    if (!suggestions.length) return;

    setActiveIndex((current) => {
      if (direction > 0) {
        return current < 0 ? 0 : (current + 1) % suggestions.length;
      }

      if (current <= 0) return suggestions.length - 1;
      return current - 1;
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActiveIndex(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActiveIndex(-1);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        goToApp(suggestions[activeIndex]);
        return;
      }

      goToResults();
    }
  };

  const trimmedQuery = query.trim();
  const showSuggestions = suggestions.length > 0;
  const showRecent = !trimmedQuery && recentItems.length > 0;
  const showViewAll = showSuggestions && !!trimmedQuery;

  if (!isOpen) return null;

  return (
    <div
      className={`${styles.overlay} ${styles.overlayOpen}`}
      onMouseDown={handleOverlayMouseDown}
      role="presentation"
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label="Search apps"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.inputRow}>
          <FiSearch className={styles.searchIcon} size={18} strokeWidth={2.5} />
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            onMouseDown={() => setActiveIndex(-1)}
            placeholder="Search apps..."
            autoComplete="off"
            spellCheck={false}
            aria-label="Search apps"
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            aria-activedescendant={
              activeIndex >= 0 ? `search-suggestion-${activeIndex}` : undefined
            }
          />
          {query ? (
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleClear}
              aria-label="Clear search"
            >
              <FiX size={12} strokeWidth={3} />
            </button>
          ) : null}
        </div>

        {showRecent ? (
          <div className={styles.body}>
            <div className={styles.sectionLabel}>Recent</div>
            <div className={styles.recentTags}>
              {recentItems.map((item) => {
                const key =
                  item.type === "app" ? `app:${item.id}` : `query:${item.text}`;
                const label = item.type === "app" ? item.name : item.text;

                return (
                  <button
                    key={key}
                    type="button"
                    className={styles.recentTag}
                    onClick={() => handleRecentClick(item)}
                  >
                    {item.type === "app" ? (
                      <span className={styles.recentAppIcon}>
                        <AppIcon id={item.id} name={item.name} icon={item.icon} />
                      </span>
                    ) : (
                      <FiClock size={12} strokeWidth={2} />
                    )}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {showSuggestions ? (
          <div
            className={styles.body}
            ref={listRef}
            id="search-suggestions"
            role="listbox"
            aria-label="App suggestions"
          >
            <div className={styles.sectionLabel}>Apps</div>
            {suggestions.map((item, index) => (
              <button
                key={item.id}
                id={`search-suggestion-${index}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                data-index={index}
                className={`${styles.item} ${
                  index === activeIndex ? styles.itemActive : ""
                }`}
                onClick={() => goToApp(item)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <div className={styles.itemIcon}>
                  <AppIcon id={item.id} name={item.name} icon={item.icon} />
                </div>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>
                    {highlightMatch(item.name, trimmedQuery)}
                  </div>
                  <div className={styles.itemMeta}>{item.id}</div>
                </div>
                <FiChevronRight className={styles.itemArrow} size={14} strokeWidth={2.5} />
              </button>
            ))}
          </div>
        ) : null}

        {showViewAll ? (
          <div className={styles.footer}>
            <div className={styles.footerHints}>
              <span>
                <kbd>↑</kbd>
                <kbd>↓</kbd> navigate
              </span>
              <span>
                <kbd>↵</kbd> select
              </span>
            </div>
            <button type="button" className={styles.viewAll} onClick={goToResults}>
              View all results
              <FiArrowRight size={13} strokeWidth={2.5} />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default SearchDialog;
