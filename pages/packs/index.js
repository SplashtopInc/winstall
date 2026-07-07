import { useState, useEffect, useCallback } from "react";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaMicrosoft } from "react-icons/fa";
import {
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiArrowLeftCircle,
  FiArrowRightCircle,
  FiSearch,
} from "react-icons/fi";

import PageWrapper from "../../components/PageWrapper";
import MetaTags from "../../components/MetaTags";
import PackCard from "../../components/PackCard";
import CreatePackModal from "../../components/CreatePackModal";
import Error from "../../components/Error";
import { fetchMyPacks, fetchPublicPacks } from "../../utils/fetchPackAPI";
import { OWN_PACKS_UPDATED_EVENT } from "../../utils/packHelpers";

import styles from "../../styles/packsIndex.module.scss";
import appsStyles from "../../styles/apps.module.scss";
import searchStyles from "../../styles/search.module.scss";

const PACKS_PER_PAGE = 24;
const MIN_SEARCH_LENGTH = 3;

function getApiBase() {
  return process.env.NEXT_PUBLIC_WINSTALL_API_BASE || "";
}

function transformPackIcons(packs, apiBase) {
  const base = apiBase || getApiBase();
  if (!base || !packs) return packs;

  return packs.map((pack) => ({
    ...pack,
    apps: (pack.apps || []).map((app) => {
      if (app.icon && !app.icon.startsWith("http") && !app.iconUrl) {
        const iconName = app.icon.replace(".png", "");
        return {
          ...app,
          iconUrl: `${base}/icons/next/${iconName}.webp`,
          iconPng: `${base}/icons/${iconName}.png`,
        };
      }
      return app;
    }),
  }));
}

function CreatePackCard({ onClick }) {
  return (
    <li>
      <button type="button" className={styles.createCard} onClick={onClick}>
        <span className={styles.createIcon} aria-hidden="true">
          <FiPlus />
        </span>
        <span className={styles.createLabel}>Create Pack</span>
      </button>
    </li>
  );
}

export default function PacksPage() {
  const router = useRouter();
  const activeTab = router.query.tab === "public" ? "public" : "mine";

  const [publicPacks, setPublicPacks] = useState([]);
  const [publicPacksLoading, setPublicPacksLoading] = useState(false);
  const [publicPacksError, setPublicPacksError] = useState(null);
  const [publicTotal, setPublicTotal] = useState(0);
  const [publicCurrentOffset, setPublicCurrentOffset] = useState(0);
  const [publicLoadedKey, setPublicLoadedKey] = useState(null);
  const [publicPage, setPublicPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [activePublicSearch, setActivePublicSearch] = useState("");
  const [showSearching, setShowSearching] = useState(false);

  const [user, setUser] = useState(null);
  const [myPacks, setMyPacks] = useState([]);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [myPacksLoading, setMyPacksLoading] = useState(false);
  const [myPacksError, setMyPacksError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const authError = router.query.error;
  const publicLoadKey = `${publicPage}:${activePublicSearch}`;
  const publicTotalPages = Math.max(1, Math.ceil(publicTotal / PACKS_PER_PAGE));

  const loadPublicPacks = useCallback(async ({ page = 1, q, silent = false } = {}) => {
    if (!silent) {
      setPublicPacksLoading(true);
    }
    setPublicPacksError(null);

    const offset = (page - 1) * PACKS_PER_PAGE;
    const searchKey = q || "";

    try {
      const { response, error } = await fetchPublicPacks({
        offset,
        limit: PACKS_PER_PAGE,
        ...(q ? { q } : {}),
      });

      if (error) {
        setPublicPacksError(error);
        setPublicPacks([]);
      } else if (response?.data) {
        setPublicPacks(transformPackIcons(response.data, getApiBase()));
        setPublicTotal(typeof response.total === "number" ? response.total : 0);
        setPublicCurrentOffset(
          typeof response.offset === "number" ? response.offset : offset
        );
        setPublicLoadedKey(`${page}:${searchKey}`);
      }
    } catch (err) {
      setPublicPacksError(err.message || "Failed to load packs.");
    } finally {
      if (!silent) {
        setPublicPacksLoading(false);
      }
    }
  }, []);

  const loadMyPacks = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setMyPacksLoading(true);
    }
    setMyPacksError(null);

    const session = await getSession();
    setSessionChecked(true);

    if (!session) {
      setUser(null);
      setMyPacks([]);
      if (!silent) {
        setMyPacksLoading(false);
      }
      return;
    }

    setUser(session.user);

    try {
      const { response: userPacks, error } = await fetchMyPacks();

      if (error) {
        setMyPacksError(error);
        setMyPacks([]);
      } else if (userPacks) {
        setMyPacks(transformPackIcons(userPacks, getApiBase()));
      }
    } catch (err) {
      setMyPacksError(err.message || "Failed to load packs.");
    } finally {
      if (!silent) {
        setMyPacksLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (activeTab !== "public") return;
    if (publicLoadedKey === publicLoadKey) return;
    loadPublicPacks({
      page: publicPage,
      q: activePublicSearch || undefined,
    });
  }, [
    activePublicSearch,
    activeTab,
    loadPublicPacks,
    publicLoadKey,
    publicLoadedKey,
    publicPage,
  ]);

  useEffect(() => {
    if (activeTab !== "public") return;

    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();
      const nextSearch =
        trimmed.length >= MIN_SEARCH_LENGTH ? trimmed : "";

      setActivePublicSearch((current) => {
        if (current !== nextSearch) {
          setPublicPage(1);
        }
        return nextSearch;
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [activeTab, searchInput]);

  useEffect(() => {
    if (!router.isReady || activeTab !== "public") return;
    if (!router.query.q && !router.query.page) return;

    router.replace(
      { pathname: "/packs", query: { tab: "public" } },
      undefined,
      { shallow: true }
    );
  }, [activeTab, router.isReady, router.query.page, router.query.q]);

  useEffect(() => {
    const canSearch = searchInput.trim().length >= MIN_SEARCH_LENGTH;
    if (!canSearch) {
      setShowSearching(false);
      return;
    }
    setShowSearching(publicPacksLoading);
  }, [publicPacksLoading, searchInput]);

  useEffect(() => {
    if (activeTab !== "mine") return;
    loadMyPacks();
  }, [activeTab, loadMyPacks]);

  useEffect(() => {
    if (!router.isReady || router.pathname !== "/packs") return;

    const refreshActiveTab = () => {
      if (activeTab === "mine") {
        loadMyPacks({ silent: true });
      } else {
        loadPublicPacks({
          page: publicPage,
          q: activePublicSearch || undefined,
          silent: true,
        });
      }
    };

    const handlePageShow = (event) => {
      if (event.persisted) {
        refreshActiveTab();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshActiveTab();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    activePublicSearch,
    activeTab,
    loadMyPacks,
    loadPublicPacks,
    publicPage,
    router.isReady,
    router.pathname,
  ]);

  useEffect(() => {
    const handleOwnPacksUpdated = (event) => {
      const updatedPack = event.detail;
      if (!updatedPack?._id) return;

      const [pack] = transformPackIcons([updatedPack], getApiBase());
      setMyPacks((current) =>
        current.map((item) =>
          item._id === pack._id ? { ...item, ...pack } : item
        )
      );
    };

    window.addEventListener(OWN_PACKS_UPDATED_EVENT, handleOwnPacksUpdated);

    return () => {
      window.removeEventListener(OWN_PACKS_UPDATED_EVENT, handleOwnPacksUpdated);
    };
  }, []);

  const setTab = (tab) => {
    const query = tab === "public" ? { tab: "public" } : {};
    router.push({ pathname: "/packs", query }, undefined, { shallow: true });
  };

  const handlePublicPrevious = () => {
    window.scrollTo(0, 0);
    setPublicPage((current) => Math.max(1, current - 1));
  };

  const handlePublicNext = () => {
    window.scrollTo(0, 0);
    setPublicPage((current) => current + 1);
  };

  useEffect(() => {
    if (activeTab !== "public") return;

    const handlePagination = (e) => {
      if (e.keyCode === 39) {
        document.getElementById("public-packs-next")?.click();
      } else if (e.keyCode === 37) {
        document.getElementById("public-packs-previous")?.click();
      }
    };

    document.addEventListener("keydown", handlePagination);
    return () => document.removeEventListener("keydown", handlePagination);
  }, [activeTab]);

  const PublicPagination = ({ small }) => (
    <div className={small ? appsStyles.minPagination : appsStyles.pagbtn}>
      <button
        type="button"
        className={`button ${small ? appsStyles.smallBtn : ""}`}
        id={!small ? "public-packs-previous" : undefined}
        onClick={handlePublicPrevious}
        title="Previous page of packs"
        disabled={publicPage > 1 ? undefined : "disabled"}
      >
        <FiChevronLeft />
        {!small ? "Previous" : ""}
      </button>
      <button
        type="button"
        className={`button ${small ? appsStyles.smallBtn : ""}`}
        id={!small ? "public-packs-next" : undefined}
        title="Next page of packs"
        onClick={handlePublicNext}
        disabled={
          publicPage < publicTotalPages ? undefined : "disabled"
        }
      >
        {!small ? "Next" : ""}
        <FiChevronRight />
      </button>
    </div>
  );

  const handleLogin = (provider) => {
    signIn(provider, { callbackUrl: "/packs?tab=mine" });
  };

  const handlePackCreated = (newPack) => {
    const [pack] = transformPackIcons(
      [{ ...newPack, apps: newPack.apps || [] }],
      getApiBase()
    );
    setMyPacks((current) => [...current, pack]);
    setShowCreateModal(false);
  };

  const getPublicSummary = () => {
    if (publicPacks.length === 0) {
      return activePublicSearch
        ? `No packs matching "${activePublicSearch}".`
        : "No packs to show";
    }

    const range = `Showing ${publicCurrentOffset + 1}-${publicCurrentOffset + publicPacks.length} of ${publicTotal.toLocaleString()}`;
    const pageInfo = `(page ${publicPage} of ${publicTotalPages})`;

    if (activePublicSearch) {
      return `${range} results for "${activePublicSearch}" ${pageInfo}.`;
    }

    return `${range} packs ${pageInfo}.`;
  };

  const renderPublicPacks = () => {
    if (publicPacksLoading && publicPacks.length === 0) {
      return <p className={styles.loading}>Loading...</p>;
    }

    if (publicPacksError) {
      return <Error title="Oops!" subtitle={publicPacksError} />;
    }

    return (
      <>
        <div className={styles.searchSection}>
          <label htmlFor="public-packs-search" className={searchStyles.searchLabel}>
            Search public packs
          </label>
          <div className={searchStyles.searchBox}>
            <div className={searchStyles.searchInner}>
              <FiSearch />
              <input
                type="text"
                id="public-packs-search"
                minLength={2}
                value={searchInput}
                autoComplete="off"
                placeholder="Search by pack name or description"
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </div>
            {showSearching && (
              <span className={searchStyles.searchingLabel}>Searching...</span>
            )}
          </div>
        </div>

        <div className={styles.publicControls}>
          <p>{getPublicSummary()}</p>
          <PublicPagination small />
        </div>

        <ul className={styles.grid}>
          {publicPacks.map((pack) => (
            <li key={pack._id}>
              <PackCard pack={pack} />
            </li>
          ))}
        </ul>

        <div className={appsStyles.pagination}>
          <PublicPagination />
          <em>
            Hit the <FiArrowLeftCircle /> and <FiArrowRightCircle /> keys on
            your keyboard to navigate between pages quickly.
          </em>
        </div>
      </>
    );
  };

  const renderMyPacks = () => {
    if (!sessionChecked || myPacksLoading) {
      return <p className={styles.loading}>Loading...</p>;
    }

    if (!user) {
      return (
        <section className={styles.signInSection}>
          <h1 className={styles.signInTitle}>
            Sign in to create and manage your own app packs.
          </h1>
          <p className={styles.signInSubtitle}>
            Share them publicly or keep them just for you.
          </p>
          {authError && (
            <p className={styles.authError}>
              Authentication failed. Please try again.
            </p>
          )}
          <div className={styles.loginButtons}>
            <button
              type="button"
              className={styles.loginCard}
              onClick={() => handleLogin("google")}
            >
              <FcGoogle />
              Continue with Google
            </button>
            <button
              type="button"
              className={styles.loginCard}
              onClick={() => handleLogin("github")}
            >
              <FaGithub />
              Continue with GitHub
            </button>
            <button
              type="button"
              className={styles.loginCard}
              onClick={() => handleLogin("azure-ad")}
            >
              <FaMicrosoft />
              Continue with Microsoft
            </button>
          </div>
        </section>
      );
    }

    if (myPacksError) {
      return <Error title="Oops!" subtitle={myPacksError} />;
    }

    if (myPacks.length === 0) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon} aria-hidden="true">
            <FiPlus />
          </div>
          <h2 className={styles.emptyTitle}>No packs yet</h2>
          <p className={styles.emptyDescription}>
            Bundle your go-to apps into a single pack — install them all at once
            on any new machine, or share with your team.
          </p>
          <button
            type="button"
            className={styles.emptyCreateButton}
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus /> Create Your First Pack
          </button>
        </div>
      );
    }

    return (
      <ul className={styles.grid}>
        <CreatePackCard onClick={() => setShowCreateModal(true)} />
        {myPacks.map((pack) => (
          <li key={pack._id}>
            <PackCard pack={pack} />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <PageWrapper>
      <MetaTags
        title="App Packs - winstall"
        desc="Browse community app collections or create and manage your own app packs."
        path="/packs"
      />

      <div className={styles.page}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === "mine" ? styles.tabActive : ""}`}
            onClick={() => setTab("mine")}
          >
            My Packs
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === "public" ? styles.tabActive : ""}`}
            onClick={() => setTab("public")}
          >
            Public Packs
          </button>
        </div>

        {activeTab === "mine" ? renderMyPacks() : renderPublicPacks()}
      </div>

      {user && (
        <CreatePackModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          user={user}
          onCreated={handlePackCreated}
        />
      )}
    </PageWrapper>
  );
}
