import {
  FiChevronLeft,
  FiChevronRight,
  FiArrowLeftCircle,
  FiArrowRightCircle,
} from "react-icons/fi";

import PackCard from "./PackCard";
import Error from "./Error";

import styles from "../styles/packsIndex.module.scss";
import appsStyles from "../styles/apps.module.scss";

function Pagination({ small, page, totalPages, onPrevious, onNext }) {
  return (
    <div className={small ? appsStyles.minPagination : appsStyles.pagbtn}>
      <button
        type="button"
        className={`button ${small ? appsStyles.smallBtn : ""}`}
        id={!small ? "public-packs-previous" : undefined}
        onClick={onPrevious}
        title="Previous page of packs"
        disabled={page > 1 ? undefined : "disabled"}
      >
        <FiChevronLeft />
        {!small ? "Previous" : ""}
      </button>
      <button
        type="button"
        className={`button ${small ? appsStyles.smallBtn : ""}`}
        id={!small ? "public-packs-next" : undefined}
        onClick={onNext}
        title="Next page of packs"
        disabled={page < totalPages ? undefined : "disabled"}
      >
        {!small ? "Next" : ""}
        <FiChevronRight />
      </button>
    </div>
  );
}

function getSummary({
  packs,
  searchQuery,
  currentOffset,
  total,
  page,
  totalPages,
}) {
  if (packs.length === 0) {
    return searchQuery
      ? `No packs matching "${searchQuery}".`
      : "No packs to show";
  }

  const range = `Showing ${currentOffset + 1}-${currentOffset + packs.length} of ${total.toLocaleString()}`;
  const pageInfo = `(page ${page} of ${totalPages})`;

  if (searchQuery) {
    return `${range} results for "${searchQuery}" ${pageInfo}.`;
  }

  return `${range} packs ${pageInfo}.`;
}

export default function PublicPacksList({
  packs,
  loading,
  error,
  hasLoaded,
  searchQuery,
  page,
  totalPages,
  total,
  currentOffset,
  onPrevious,
  onNext,
}) {
  const isInitialLoad = !hasLoaded && loading;
  const isSearching = loading && !!searchQuery;

  if (isInitialLoad) {
    return <p className={styles.loading}>Loading...</p>;
  }

  if (error) {
    return <Error title="Oops!" subtitle={error} />;
  }

  const summary = isSearching
    ? "Searching..."
    : getSummary({
        packs,
        searchQuery,
        currentOffset,
        total,
        page,
        totalPages,
      });

  return (
    <>
      <div className={styles.publicControls}>
        <p>{summary}</p>
        <Pagination
          small
          page={page}
          totalPages={totalPages}
          onPrevious={onPrevious}
          onNext={onNext}
        />
      </div>

      <ul className={styles.grid}>
        {packs.map((pack) => (
          <li key={pack._id}>
            <PackCard pack={pack} showVisibility={false} />
          </li>
        ))}
      </ul>

      <div className={appsStyles.pagination}>
        <Pagination
          page={page}
          totalPages={totalPages}
          onPrevious={onPrevious}
          onNext={onNext}
        />
        <em>
          Hit the <FiArrowLeftCircle /> and <FiArrowRightCircle /> keys on your
          keyboard to navigate between pages quickly.
        </em>
      </div>
    </>
  );
}
