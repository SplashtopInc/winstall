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
  const [offset, setOffset] = useState(0);
  const [sort, setSort] = useState();

  const appsPerPage = 60;

  const totalPages = Math.ceil(apps.length / appsPerPage);

  useEffect(() => {
    // Default to showing most recently updated first to entice Google to index
    // them, and to demonstrate to users that the site is being kept up-to-date.
    let sortOrder = Router.query.sort || "update-desc";
    applySort(data, sortOrder);
    setSort(sortOrder);
    setApps(data);

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

    setPagination(apps.length);

    return () => document.removeEventListener("keydown", handlePagination);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setPagination = (appCount) => {
    let requestedPage = parseInt(Router.query.page);
    if (requestedPage) {
      let maxPages = Math.round(appCount / appsPerPage) + 1;

      // we check if its a valid page number
      if (requestedPage > maxPages || requestedPage < 2) return;

      // if it is, we continue
      let calculateOffset = appsPerPage * (requestedPage - 1);
      setOffset(calculateOffset);
    }
  };

  let handleNext = () => {
    window.scrollTo(0, 0);
    setOffset((offset) => offset + appsPerPage);

    Router.replace({
      pathname: "/apps",
      query: {
        page: Math.round((offset + appsPerPage - 1) / appsPerPage) + 1,
      },
    });
  };

  let handlePrevious = () => {
    window.scrollTo(0, 0);
    setOffset((offset) => offset - appsPerPage);

    Router.replace({
      pathname: "/apps",
      query: {
        page: Math.round((offset + appsPerPage - 1) / appsPerPage) - 1,
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
          disabled={offset > 0 ? (disable ? "disabled" : null) : "disabled"}
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
            offset + appsPerPage < apps.length
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
        {!searchInput && <h1>All apps {`(${apps.length.toLocaleString()})`}</h1>}
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

  if (!apps) return <></>;

  return (
    <div>
      <MetaTags title="Apps - winstall" />

      <div className={styles.controls}>
        <Title />

        <Pagination small disable={searchInput ? true : false} />
      </div>

      <Search
        apps={apps}
        onSearch={(q) => setSearchInput(q)}
        label={"Search for apps"}
        placeholder={"Enter you search term here"}
      />

      <div className={styles.controls}>
        {!searchInput && (
          <>
            <p>
              Showing {apps.slice(offset, offset + appsPerPage).length} apps
              (page {Math.round((offset + appsPerPage - 1) / appsPerPage)} of{" "}
              {totalPages}).
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
          {apps.slice(offset, offset + appsPerPage).map((app, index) => (
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
  let { response: apps, error } = await fetchWinstallAPI(`/apps`, {}, true);

  if (error) return { props: { error } };

  return {
    props: {
      data: apps ?? null,
    },
  };
}

export default Store;
