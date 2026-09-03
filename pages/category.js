import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";

import PageWrapper from "../components/PageWrapper";
import MetaTags from "../components/MetaTags";
import SingleApp from "../components/SingleApp";
import Error from "../components/Error";
import CategoryTabs, { VISIBLE_TAB_COUNT } from "../components/categoryTabs";
import { fetchCategoryApps } from "../utils/fetchCategoryApps";
import { getDocumentShellStaticProps } from "../utils/documentShellStaticProps";
import styles from "../styles/categoryPage.module.scss";

export const PAGE_SIZE = 56;

export const CATEGORY_SLUGS = Object.freeze([
  "browser",
  "communication",
  "productivity",
  "documents",
  "collaboration",
  "cloud_storage",
  "development",
  "entertainment",
  "utilities",
  "security",
  "game",
  "photo",
  "screenshots",
  "runtimes",
]);

export const CATEGORY_LABELS = Object.freeze({
  browser: "Web Browsers",
  communication: "Communication",
  productivity: "Productivity",
  documents: "Office & Documents",
  collaboration: "Meeting & Collaboration",
  cloud_storage: "Cloud Storage & Sync",
  development: "Developer Tools",
  entertainment: "Media & Entertainment",
  utilities: "Utilities",
  security: "Security",
  game: "Game",
  photo: "Photo, Design & Video",
  screenshots: "Screenshots & Screen Recording",
  runtimes: "Runtimes",
});

const DEFAULT_CATEGORY = "browser";

const CATEGORIES = CATEGORY_SLUGS.map((slug) => ({
  slug,
  label: CATEGORY_LABELS[slug] || slug,
}));

function isValidCategorySlug(slug) {
  return typeof slug === "string" && CATEGORY_SLUGS.includes(slug);
}

function CategoryPage() {
  const router = useRouter();
  const [activeSlug, setActiveSlug] = useState(DEFAULT_CATEGORY);
  const [expanded, setExpanded] = useState(false);
  const [apps, setApps] = useState([]);
  const [total, setTotal] = useState(0);
  const [nextOffset, setNextOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const syncCategoryToUrl = useCallback(
    (slug) => {
      if (!router.isReady) return;
      const current = router.query.category;
      if (current === slug) return;
      router.replace(
        { pathname: "/category", query: { category: slug } },
        undefined,
        { shallow: true }
      );
    },
    [router]
  );

  useEffect(() => {
    if (!router.isReady) return;

    const raw = router.query.category;
    const fromQuery = Array.isArray(raw) ? raw[0] : raw;

    if (!isValidCategorySlug(fromQuery)) {
      setActiveSlug(DEFAULT_CATEGORY);
      syncCategoryToUrl(DEFAULT_CATEGORY);
      return;
    }

    setActiveSlug(fromQuery);
  }, [router.isReady, router.query.category, syncCategoryToUrl]);

  useEffect(() => {
    if (!router.isReady) return;

    let cancelled = false;

    async function loadFirstPage() {
      setIsLoading(true);
      setIsLoadingMore(false);
      setError("");
      setApps([]);
      setTotal(0);
      setNextOffset(0);

      const result = await fetchCategoryApps({
        slug: activeSlug,
        offset: 0,
        limit: PAGE_SIZE,
      });

      if (cancelled) return;

      if (result.error) {
        setApps([]);
        setTotal(0);
        setNextOffset(0);
        setError(result.error);
        setIsLoading(false);
        return;
      }

      setApps(result.items);
      setTotal(result.total);
      setNextOffset(result.offset + result.items.length);
      setError("");
      setIsLoading(false);
    }

    loadFirstPage();

    return () => {
      cancelled = true;
    };
  }, [activeSlug, router.isReady]);

  const handleSelect = (slug) => {
    if (slug === activeSlug) return;
    setActiveSlug(slug);
    syncCategoryToUrl(slug);

    if (!expanded) return;
    const index = CATEGORY_SLUGS.indexOf(slug);
    if (index >= 0 && index < VISIBLE_TAB_COUNT) {
      // Keep expanded until user collapses; no auto-collapse on select.
    }
  };

  const handleToggleExpanded = () => {
    if (expanded) {
      const index = CATEGORY_SLUGS.indexOf(activeSlug);
      if (index >= VISIBLE_TAB_COUNT) {
        setActiveSlug(DEFAULT_CATEGORY);
        syncCategoryToUrl(DEFAULT_CATEGORY);
      }
      setExpanded(false);
      return;
    }
    setExpanded(true);
  };

  const handleLoadMore = async () => {
    if (isLoading || isLoadingMore || apps.length >= total) return;

    setIsLoadingMore(true);
    const result = await fetchCategoryApps({
      slug: activeSlug,
      offset: nextOffset,
      limit: PAGE_SIZE,
    });

    if (result.error) {
      setIsLoadingMore(false);
      return;
    }

    setApps((prev) => [...prev, ...result.items]);
    setTotal(result.total);
    setNextOffset(result.offset + result.items.length);
    setIsLoadingMore(false);
  };

  const showLoadMore = !isLoading && !error && total > 0 && apps.length < total;

  return (
    <PageWrapper>
      <MetaTags
        title="Apps by Category - winstall"
        desc="Browse Windows apps by category and add them to your install list."
        path="/category"
      />

      <div className={styles.page}>
        <CategoryTabs
          categories={CATEGORIES}
          activeSlug={activeSlug}
          expanded={expanded}
          onSelect={handleSelect}
          onToggleExpanded={handleToggleExpanded}
        />

        {error ? (
          <Error
            detail={error}
            primaryHref="/category"
            primaryLabel="Try again"
            primaryIcon="grid"
          />
        ) : isLoading ? (
          <p className={styles.status}>Loading apps…</p>
        ) : apps.length === 0 ? (
          <p className={styles.status}>No apps in this category yet.</p>
        ) : (
          <>
            <ul className={styles.grid}>
              {apps.map((app) => (
                <li key={app._id || app.id || app.packageId || app.name}>
                  <SingleApp app={app} showSelectCheckbox />
                </li>
              ))}
            </ul>

            {showLoadMore && (
              <div className={styles.loadMoreWrap}>
                <button
                  type="button"
                  className={styles.loadMore}
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  );
}

export default CategoryPage;

export async function getStaticProps() {
  return getDocumentShellStaticProps();
}
