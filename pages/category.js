import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";

import PageWrapper from "../components/PageWrapper";
import MetaTags from "../components/MetaTags";
import SingleApp from "../components/SingleApp";
import Error from "../components/Error";
import CategoryTabs from "../components/categoryTabs";
import { fetchCategoryApps } from "../utils/fetchCategoryApps";
import { getDocumentShellStaticProps } from "../utils/documentShellStaticProps";
import { CATEGORY_LABELS, CATEGORY_SLUGS } from "../utils/categoryMeta";
import styles from "../styles/categoryPage.module.scss";

export const PAGE_SIZE = 56;

export { CATEGORY_LABELS, CATEGORY_SLUGS };

const DEFAULT_CATEGORY = "all";

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
  const [visibleTabCount, setVisibleTabCount] = useState(CATEGORY_SLUGS.length);
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

  useEffect(() => {
    const index = CATEGORY_SLUGS.indexOf(activeSlug);
    if (index >= visibleTabCount) {
      setExpanded(true);
    }
  }, [activeSlug, visibleTabCount]);

  const handleSelect = (slug) => {
    if (slug === activeSlug) return;
    setActiveSlug(slug);
    syncCategoryToUrl(slug);
  };

  const handleToggleExpanded = () => {
    if (expanded) {
      const index = CATEGORY_SLUGS.indexOf(activeSlug);
      if (index >= visibleTabCount) {
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
          onVisibleCountChange={setVisibleTabCount}
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
