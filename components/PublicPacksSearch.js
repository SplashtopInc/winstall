import { useEffect, memo } from "react";
import { FiSearch, FiX } from "react-icons/fi";

import styles from "../styles/packsIndex.module.scss";
import searchStyles from "../styles/search.module.scss";

const MIN_SEARCH_LENGTH = 3;

function PublicPacksSearch({ input, onInputChange, onSearchChange, onClear }) {
  const trimmed = (input || "").trim();
  const needsMoreChars =
    trimmed.length > 0 && trimmed.length < MIN_SEARCH_LENGTH;
  const canClear = (input || "").length > 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      const nextTrimmed = (input || "").trim();
      const query = nextTrimmed.length >= MIN_SEARCH_LENGTH ? nextTrimmed : "";
      onSearchChange(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [input, onSearchChange]);

  return (
    <div className={styles.searchSection}>
      <div className={`${searchStyles.searchBox} ${styles.publicSearchBox}`}>
        <div
          className={`${searchStyles.searchInner} ${styles.publicSearchInner}`}
        >
          <FiSearch aria-hidden="true" />
          <input
            type="text"
            id="public-packs-search"
            className={styles.publicSearchInput}
            value={input}
            autoComplete="off"
            aria-label="Search public packs"
            placeholder="Search by pack name or description"
            onChange={(event) => onInputChange(event.target.value)}
          />
          {canClear && (
            <button
              type="button"
              className={styles.searchClear}
              onClick={onClear}
              aria-label="Clear search"
            >
              <FiX aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      {needsMoreChars && (
        <p className={styles.searchHint} role="status">
          Enter at least {MIN_SEARCH_LENGTH} characters to search.
        </p>
      )}
    </div>
  );
}

export default memo(PublicPacksSearch);
