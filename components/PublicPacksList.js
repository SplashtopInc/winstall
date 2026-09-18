import PackCard from "./PackCard";
import Error from "./Error";
import ShelfListSkeleton from "./shelfListSkeleton";

import styles from "../styles/packsIndex.module.scss";

function getSummary({ packs, searchQuery, total }) {
  if (packs.length === 0) {
    return searchQuery
      ? `No packs matching "${searchQuery}".`
      : "No packs to show";
  }

  if (searchQuery) {
    return `Showing ${packs.length} of ${total.toLocaleString()} results for "${searchQuery}".`;
  }

  return `Showing ${packs.length} of ${total.toLocaleString()} packs.`;
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

  const summary =
    loading && searchQuery
      ? "Searching..."
      : getSummary({ packs, searchQuery, total });
  const showLoadMore = packs.length > 0 && packs.length < total;

  return (
    <>
      <div className={styles.publicControls}>
        <p>{summary}</p>
        {packs.length === 0 && searchQuery && (
          <button
            type="button"
            className={styles.clearSearchLink}
            onClick={onClearSearch}
          >
            Clear search
          </button>
        )}
      </div>

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
