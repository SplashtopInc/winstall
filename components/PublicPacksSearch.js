import { useState, useEffect, memo } from "react";
import { FiSearch } from "react-icons/fi";

import styles from "../styles/packsIndex.module.scss";
import searchStyles from "../styles/search.module.scss";

const MIN_SEARCH_LENGTH = 3;

function PublicPacksSearch({ onSearchChange }) {
  const [input, setInput] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = input.trim();
      const query = trimmed.length >= MIN_SEARCH_LENGTH ? trimmed : "";
      onSearchChange(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [input, onSearchChange]);

  return (
    <div className={styles.searchSection}>
      <div className={`${searchStyles.searchBox} ${styles.publicSearchBox}`}>
        <div className={`${searchStyles.searchInner} ${styles.publicSearchInner}`}>
          <FiSearch />
          <input
            type="text"
            id="public-packs-search"
            className={styles.publicSearchInput}
            minLength={2}
            value={input}
            autoComplete="off"
            aria-label="Search public packs"
            placeholder="Search by pack name or description"
            onChange={(event) => setInput(event.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export default memo(PublicPacksSearch);
