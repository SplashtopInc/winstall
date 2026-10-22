import { Fragment, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";

import PageWrapper from "../../components/PageWrapper";
import MetaTags from "../../components/MetaTags";
import SingleApp from "../../components/SingleApp";
import DonateCard from "../../components/DonateCard";
import Error from "../../components/Error";
import CategoryTabs from "../../components/categoryTabs";
import ShelfListSkeleton from "../../components/shelfListSkeleton";
import useRandomAd from "../../hooks/useRandomAd";
import { fetchCategoryApps } from "../../utils/fetchCategoryApps";
import { getDocumentShellStaticProps } from "../../utils/documentShellStaticProps";
import { CATEGORY_LABELS, CATEGORY_SLUGS } from "../../utils/categoryMeta";
import {
  SHELF_SLUGS,
  categoryDocumentTitle,
  categoryPagePath,
  isShelfSlug,
} from "../../utils/categoryShelfPath";
import styles from "../../styles/categoryPage.module.scss";

export const PAGE_SIZE = 60;
export const FIRST_PAGE_SIZE = PAGE_SIZE - 1;
export const SHELF_AD_INDEX = 0;

export { CATEGORY_LABELS, CATEGORY_SLUGS };

const DEFAULT_CATEGORY = "all";

const CATEGORIES = CATEGORY_SLUGS.map((slug) => ({
  slug,
  label: CATEGORY_LABELS[slug] || slug,
}));

function slugParts(slugParam) {
  if (slugParam == null || slugParam === false) return [];
  return Array.isArray(slugParam) ? slugParam : [slugParam];
}

function shelfFromParts(parts) {
  if (parts.length === 1 && isShelfSlug(parts[0])) return parts[0];
  return DEFAULT_CATEGORY;
}

function isShelfPath(parts) {
  return parts.length === 0 || (parts.length === 1 && isShelfSlug(parts[0]));
}

function CategoryPage({ categorySlug = DEFAULT_CATEGORY }) {
  const router = useRouter();
  const [activeSlug, setActiveSlug] = useState(categorySlug);
  const [expanded, setExpanded] = useState(false);
  const [visibleTabCount, setVisibleTabCount] = useState(CATEGORY_SLUGS.length);
  const [apps, setApps] = useState([]);
  const [total, setTotal] = useState(0);
  const [nextOffset, setNextOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const shelfAd = useRandomAd("apps-list");

  const syncCategoryToUrl = useCallback(
    (slug) => {
      if (!router.isReady) return;
      const path = categoryPagePath(slug);
      const current = router.asPath.split(/[?#]/)[0];
      if (current === path) return;
      router.replace(path, undefined, { shallow: true });
    },
    [router]
  );

  const slugKey = slugParts(router.query.slug).join("/");

  useEffect(() => {
    if (!router.isReady) return;

    const parts = slugKey ? slugKey.split("/") : [];
    if (!isShelfPath(parts)) {
      router.replace(categoryPagePath(DEFAULT_CATEGORY), undefined, {
        shallow: true,
      });
      return;
    }

    setActiveSlug(shelfFromParts(parts));
  }, [router, router.isReady, slugKey]);

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
        limit: FIRST_PAGE_SIZE,
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
    syncCategoryToUrl(slug);
  };

  const handleToggleExpanded = () => {
    if (expanded) {
      const index = CATEGORY_SLUGS.indexOf(activeSlug);
      if (index >= visibleTabCount) {
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
        title={categoryDocumentTitle(activeSlug)}
        desc="Browse Windows apps by category and add them to your install list."
        path={categoryPagePath(activeSlug)}
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
          <ShelfListSkeleton
            variant="app"
            gridClassName={styles.grid}
            label="Loading apps"
          />
        ) : apps.length === 0 ? (
          <p className={styles.status}>No apps in this category yet.</p>
        ) : (
          <>
            <ul className={styles.grid}>
              {apps.map((app, index) => {
                const appKey = app._id || app.id || app.packageId || app.name;
                return (
                  <Fragment key={appKey}>
                    <SingleApp app={app} showSelectCheckbox />
                    {shelfAd && index === SHELF_AD_INDEX && (
                      <li className={styles.adCell}>
                        <DonateCard addMargin="" placement="apps-list" />
                      </li>
                    )}
                  </Fragment>
                );
              })}
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

export async function getStaticPaths() {
  return {
    paths: [
      { params: { slug: false } },
      ...SHELF_SLUGS.map((slug) => ({ params: { slug: [slug] } })),
    ],
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  const parts = slugParts(params?.slug);
  if (!isShelfPath(parts)) {
    return {
      redirect: {
        destination: categoryPagePath(DEFAULT_CATEGORY),
        permanent: true,
      },
    };
  }

  const shell = await getDocumentShellStaticProps();
  return {
    ...shell,
    props: {
      categorySlug: shelfFromParts(parts),
    },
  };
}
