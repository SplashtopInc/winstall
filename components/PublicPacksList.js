import PackCard from "./PackCard";
import Error from "./Error";
import ShelfListSkeleton from "./shelfListSkeleton";

import styles from "../styles/packsIndex.module.scss";

function getEmptyMessage({ searchQuery }) {
  return searchQuery
    ? `No packs matching "${searchQuery}".`
    : "No packs to show";
}

export default function PublicPacksList({
  packs,
  loading,
  loadingMore,
  error,
  hasLoaded,
  searchQuery,
  total,
  onLoadMore,
  onClearSearch,
}) {
  const isInitialLoad = !hasLoaded && loading;

  if (isInitialLoad) {
    return (
      <ShelfListSkeleton
        variant="pack"
        gridClassName={styles.grid}
        label="Loading packs"
      />
    );
  }

  if (error) {
    return <Error detail={error} />;
  }

  const isSearching = loading && !!searchQuery;
  const showEmptyControls = packs.length === 0;
  const showLoadMore = packs.length > 0 && packs.length < total;

  return (
    <>
      {showEmptyControls && (
        <div className={styles.publicControls}>
          <p>{isSearching ? "Searching..." : getEmptyMessage({ searchQuery })}</p>
          {searchQuery && !isSearching && (
            <button
              type="button"
              className={styles.clearSearchLink}
              onClick={onClearSearch}
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {packs.length > 0 && (
        <ul className={styles.grid}>
          {packs.map((pack) => (
            <li key={pack._id}>
              <PackCard pack={pack} showVisibility={false} />
            </li>
          ))}
        </ul>
      )}

      {showLoadMore && (
        <div className={styles.loadMoreWrap}>
          <button
            type="button"
            className={styles.loadMore}
            onClick={onLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </>
  );
}
