import styles from "../styles/search.module.scss";

function SearchEmptyState({ query }) {
  return (
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
        No apps found for "<span className={styles.emptyQuery}>{query}</span>"
      </h2>
      <p className={styles.emptyDesc}>
        We couldn't find any apps matching your search. Try a different keyword or browse these suggestions.
      </p>
    </div>
  );
}

export default SearchEmptyState;
