import React, { useState, useEffect } from "react";
import styles from "../styles/apps.module.scss";

import SingleApp from "../components/SingleApp";
import Footer from "../components/Footer";
import { ListSort, applySort } from "../components/ListSort";
import MetaTags from "../components/MetaTags";
import Search from "../components/Search";

import {
  FiChevronLeft,
  FiChevronRight,
  FiArrowLeftCircle,
  FiArrowRightCircle,
} from "react-icons/fi";

import Router from "next/router";
import fetchWinstallAPI from "../utils/fetchWinstallAPI";
import Error from "../components/Error";
import DonateCard from "../components/DonateCard";

function Store({ data, error }) {
  if (error) return <Error title="Oops!" subtitle={error} />;

  const [apps, setApps] = useState([]);
  const [searchInput, setSearchInput] = useState();
  const [sort, setSort] = useState();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalKnown, setTotalKnown] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [clientError, setClientError] = useState("");

  const appsPerPage = 60;
  const totalPages = totalKnown ? Math.ceil(total / appsPerPage) : 0;

  const normalizeAppsPayload = (payload) => {
    if (!payload) return { items: [], total: 0, totalKnown: false, offset: 0, limit: 0 };

    if (Array.isArray(payload)) {
      return { items: payload, total: payload.length, totalKnown: false, offset: 0, limit: payload.length };
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
  };

  const loadPage = async (targetPage, shouldThrow = false) => {
    const offset = (targetPage - 1) * appsPerPage;
    setClientError("");

    const { response, error: fetchError } = await fetchWinstallAPI(
      `/apps?offset=${offset}&limit=${appsPerPage}`,
      {},
      shouldThrow
    );

    if (fetchError) {
      setClientError(fetchError);
      return;
    }

    const normalized = normalizeAppsPayload(response);
    if (normalized.items.length) {
      applySort(normalized.items, Router.query.sort || "update-desc");
    }
    setApps(normalized.items);
    setTotal(normalized.total);
    setTotalKnown(normalized.totalKnown);
    setCurrentOffset(normalized.offset);
  };

  useEffect(() => {
    // Default to showing most recently updated first to entice Google to index
    // them, and to demonstrate to users that the site is being kept up-to-date.
    let sortOrder = Router.query.sort || "update-desc";
    setSort(sortOrder);

    const initialPage = parseInt(Router.query.page) || 1;
    setPage(initialPage);

    const normalized = normalizeAppsPayload(data);
    if (normalized.items.length) {
      applySort(normalized.items, sortOrder);
      setApps(normalized.items);
      setTotal(normalized.total);
      setTotalKnown(normalized.totalKnown);
      setCurrentOffset(normalized.offset);
    }

    let handlePagination = (e) => {
      if (e.keyCode === 39) {
        let nextBtn = document.getElementById("next");

        if (nextBtn) {
          document.getElementById("next").click();
        }
      } else if (e.keyCode === 37) {
        let previousBtn = document.getElementById("previous");

        if (previousBtn) {
          document.getElementById("previous").click();
        }
      }
    };

    document.addEventListener("keydown", handlePagination);

    return () => document.removeEventListener("keydown", handlePagination);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (page === 1 && apps.length > 0) return;
    loadPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  let handleNext = () => {
    window.scrollTo(0, 0);
    const nextPage = page + 1;
    setPage(nextPage);

    Router.replace({
      pathname: "/apps",
      query: {
        page: nextPage,
      },
    });
  };

  let handlePrevious = () => {
    window.scrollTo(0, 0);
    const previousPage = Math.max(1, page - 1);
    setPage(previousPage);

    Router.replace({
      pathname: "/apps",
      query: {
        page: previousPage,
      },
    });
  };

  let Pagination = ({ small, disable }) => {
    return (
      <div className={small ? styles.minPagination : styles.pagbtn}>
        <button
          className={`button ${small ? styles.smallBtn : null}`}
          id={!small ? "previous" : ""}
          onClick={handlePrevious}
          title="Previous page of apps"
          disabled={page > 1 ? (disable ? "disabled" : null) : "disabled"}
        >
          <FiChevronLeft />
          {!small ? "Previous" : ""}
        </button>
        <button
          className={`button ${small ? styles.smallBtn : null}`}
          id={!small ? "next" : ""}
          title="Next page of apps"
          onClick={handleNext}
          disabled={
            totalKnown
              ? page < totalPages
                ? disable
                  ? "disabled"
                  : null
                : "disabled"
              : apps.length === appsPerPage
              ? disable
                ? "disabled"
                : null
              : "disabled"
          }
        >
          {!small ? "Next" : ""}
          <FiChevronRight />
        </button>
      </div>
    );
  };

  const Title = () => {
    return (
      <>
        {!searchInput && (
          <h1>
            All apps
            {totalKnown ? ` (${total.toLocaleString()})` : ""}
          </h1>
        )}
        {searchInput && (
          <>
            {searchInput.startsWith("tags: ") && (
              <h1>Tag: {searchInput.split(": ")[1]}</h1>
            )}
            {!searchInput.startsWith("tags: ") && <h1>Search results</h1>}
          </>
        )}
      </>
    );
  };

  if (clientError) return <Error title="Oops!" subtitle={clientError} />;
  if (!apps) return <></>;

  return (
    <div>
      <MetaTags title="Apps - winstall" path="/apps" />

      <div className={styles.controls}>
        <Title />

        <Pagination small disable={searchInput ? true : false} />
      </div>

      <Search
        onSearch={(q) => setSearchInput(q)}
        label={"Search for apps"}
        placeholder={"Enter you search term here"}
      />

      <div className={styles.controls}>
        {!searchInput && (
          <>
            <p>
              {apps.length === 0
                ? "No apps to show"
                : totalKnown
                ? `Showing ${currentOffset + 1}-${currentOffset + apps.length} of ${total.toLocaleString()} apps (page ${page} of ${totalPages}).`
                : `Showing ${currentOffset + 1}-${currentOffset + apps.length} apps (page ${page}).`}
            </p>
            <ListSort
              apps={apps}
              defaultSort={sort}
              onSort={(sort) => setSort(sort)}
            />
          </>
        )}
      </div>

      {!searchInput && (
        <ul className={`${styles.all} ${styles.storeList}`}>
          {apps.map((app, index) => (
            <React.Fragment key={app._id}>
              <SingleApp
                app={app}
                showTime={sort.includes("update-") ? true : false}
              />

              {index % 15 === 0 && <DonateCard addMargin="" />}
            </React.Fragment>
          ))}
        </ul>
      )}

      <div className={styles.pagination}>
        <Pagination disable={searchInput ? true : false} />
        <em>
          Hit the <FiArrowLeftCircle /> and <FiArrowRightCircle /> keys on your
          keyboard to navigate between pages quickly.
        </em>
      </div>

      <Footer />
    </div>
  );
}

export async function getStaticProps() {
  let { response, error } = await fetchWinstallAPI(
    `/apps?offset=0&limit=60`
  );

  if (error) {
    console.error('[getStaticProps /apps] Failed to fetch apps:', error);
    return {
      props: {
        data: null,
        error: 'Failed to load apps'
      },
      revalidate: 600
    };
  }

  return {
    props: {
      data: response ?? null,
    },
    revalidate: 600,
  };
}

export default Store;
