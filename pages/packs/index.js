import { useState, useEffect, useCallback, useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { FiPlus } from "react-icons/fi";

import PageWrapper from "../../components/PageWrapper";
import MetaTags from "../../components/MetaTags";
import PackCard from "../../components/PackCard";
import CreatePackModal from "../../components/CreatePackModal";
import PublicPacksSearch from "../../components/PublicPacksSearch";
import PublicPacksList from "../../components/PublicPacksList";
import Error from "../../components/Error";
import { LoginButtons } from "../../components/LoginPanel";
import { fetchMyPacks, fetchPublicPacks } from "../../utils/fetchPackAPI";
import { setLastLoginProvider } from "../../utils/lastLoginProvider";
import { getIconBase } from "../../utils/runtimeConfig";
import {
  OWN_PACKS_UPDATED_EVENT,
  PUBLIC_PACKS_UPDATED_EVENT,
} from "../../utils/packHelpers";
import { getDocumentShellStaticProps } from "../../utils/documentShellStaticProps";

import styles from "../../styles/packsIndex.module.scss";

const PACKS_PER_PAGE = 24;

function transformPackIcons(packs, apiBase) {
  const base = apiBase || getIconBase();
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
  const { data: session, status: sessionStatus } = useSession();
  const user = session?.user ?? null;
  const userId = user?.id;
  const sessionReady = sessionStatus !== "loading";

  const [activeTab, setActiveTab] = useState("mine");
  const tabHintAppliedRef = useRef(false);

  const [publicPacks, setPublicPacks] = useState([]);
  const [publicPacksLoading, setPublicPacksLoading] = useState(false);
  const [publicPacksLoadingMore, setPublicPacksLoadingMore] = useState(false);
  const [publicPacksError, setPublicPacksError] = useState(null);
  const [publicTotal, setPublicTotal] = useState(0);
  const [publicLoadedKey, setPublicLoadedKey] = useState(null);
  const [activePublicSearch, setActivePublicSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [myPacks, setMyPacks] = useState([]);
  const [myPacksLoading, setMyPacksLoading] = useState(false);
  const [myPacksError, setMyPacksError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const authError = router.query.error;
  const publicLoadKey = activePublicSearch || "";

  const loadPublicPacks = useCallback(
    async ({ offset = 0, q, append = false, silent = false } = {}) => {
      if (!silent) {
        if (append) {
          setPublicPacksLoadingMore(true);
        } else {
          setPublicPacksLoading(true);
        }
      }
      setPublicPacksError(null);

      const searchKey = q || "";

      try {
        const { response, error } = await fetchPublicPacks({
          offset,
          limit: PACKS_PER_PAGE,
          ...(q ? { q } : {}),
        });

        if (error) {
          setPublicPacksError(error);
          if (!append) {
            setPublicPacks([]);
            setPublicTotal(0);
          }
        } else if (response?.data) {
          const nextPacks = transformPackIcons(response.data, getIconBase());
          setPublicPacks((current) =>
            append ? current.concat(nextPacks) : nextPacks
          );
          setPublicTotal(
            typeof response.total === "number" ? response.total : 0
          );
          setPublicLoadedKey(searchKey);
        }
      } catch (err) {
        setPublicPacksError(err.message || "Failed to load packs.");
        if (!append) {
          setPublicPacks([]);
        }
      } finally {
        if (!silent) {
          if (append) {
            setPublicPacksLoadingMore(false);
          } else {
            setPublicPacksLoading(false);
          }
        }
      }
    },
    []
  );

  const loadMyPacks = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setMyPacksLoading(true);
    }
    setMyPacksError(null);

    try {
      const { response: userPacks, error } = await fetchMyPacks();

      if (error) {
        setMyPacksError(error);
        setMyPacks([]);
      } else if (userPacks) {
        setMyPacks(transformPackIcons(userPacks, getIconBase()));
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
    if (!router.isReady || tabHintAppliedRef.current) return;
    tabHintAppliedRef.current = true;

    if (router.query.tab === "public") {
      setActiveTab("public");
    } else if (router.query.tab === "mine") {
      setActiveTab("mine");
    }
  }, [router]);

  useEffect(() => {
    if (!router.isReady) return;
    if (!router.query.q && !router.query.page) return;

    const nextQuery = {};
    if (router.query.tab === "public" || router.query.tab === "mine") {
      nextQuery.tab = router.query.tab;
    }
    if (router.query.error) {
      nextQuery.error = router.query.error;
    }
    router.replace(
      { pathname: "/packs", query: nextQuery },
      undefined,
      { shallow: true }
    );
  }, [
    router,
    router.isReady,
    router.query.error,
    router.query.page,
    router.query.q,
    router.query.tab,
  ]);

  useEffect(() => {
    if (activeTab !== "public") return;
    if (publicLoadedKey === publicLoadKey) return;
    loadPublicPacks({
      offset: 0,
      q: activePublicSearch || undefined,
      append: false,
    });
  }, [
    activePublicSearch,
    activeTab,
    loadPublicPacks,
    publicLoadKey,
    publicLoadedKey,
  ]);

  const handlePublicSearchChange = useCallback((query) => {
    setActivePublicSearch((current) => {
      if (current !== query) {
        setPublicLoadedKey(null);
      }
      return query;
    });
  }, []);

  const handleClearPublicSearch = useCallback(() => {
    setSearchInput("");
    setActivePublicSearch((current) => {
      if (current !== "") {
        setPublicLoadedKey(null);
      }
      return "";
    });
  }, []);

  const handleLoadMorePublic = useCallback(() => {
    if (publicPacksLoading || publicPacksLoadingMore) return;
    if (publicPacks.length >= publicTotal) return;

    loadPublicPacks({
      offset: publicPacks.length,
      q: activePublicSearch || undefined,
      append: true,
    });
  }, [
    activePublicSearch,
    loadPublicPacks,
    publicPacks.length,
    publicPacksLoading,
    publicPacksLoadingMore,
    publicTotal,
  ]);

  useEffect(() => {
    if (activeTab !== "mine") return;
    if (!sessionReady) return;

    if (!userId) {
      setMyPacks([]);
      setMyPacksError(null);
      setMyPacksLoading(false);
      return;
    }

    loadMyPacks();
  }, [activeTab, loadMyPacks, sessionReady, userId]);

  useEffect(() => {
    if (!router.isReady || router.pathname !== "/packs") return;

    const refreshActiveTab = () => {
      if (activeTab === "mine") {
        if (userId) {
          loadMyPacks({ silent: true });
        }
      } else {
        loadPublicPacks({
          offset: 0,
          q: activePublicSearch || undefined,
          append: false,
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
    router.isReady,
    router.pathname,
    userId,
  ]);

  useEffect(() => {
    const handleOwnPacksUpdated = (event) => {
      const updatedPack = event.detail;
      if (!updatedPack?._id) return;

      const [pack] = transformPackIcons([updatedPack], getIconBase());
      setMyPacks((current) =>
        current.map((item) =>
          item._id === pack._id ? { ...item, ...pack } : item
        )
      );
    };

    const handlePublicPacksUpdated = () => {
      setPublicLoadedKey(null);
    };

    window.addEventListener(OWN_PACKS_UPDATED_EVENT, handleOwnPacksUpdated);
    window.addEventListener(PUBLIC_PACKS_UPDATED_EVENT, handlePublicPacksUpdated);

    return () => {
      window.removeEventListener(OWN_PACKS_UPDATED_EVENT, handleOwnPacksUpdated);
      window.removeEventListener(
        PUBLIC_PACKS_UPDATED_EVENT,
        handlePublicPacksUpdated
      );
    };
  }, []);

  const handleLogin = (provider) => {
    setLastLoginProvider(provider);
    signIn(provider, { callbackUrl: "/packs?tab=mine" });
  };

  const handlePackCreated = (newPack) => {
    const [pack] = transformPackIcons(
      [{ ...newPack, apps: newPack.apps || [] }],
      getIconBase()
    );
    setMyPacks((current) => [pack, ...current]);
    setShowCreateModal(false);
    setActiveTab("mine");
  };

  const renderPublicPacks = () => (
    <>
      <PublicPacksSearch
        input={searchInput}
        onInputChange={setSearchInput}
        onSearchChange={handlePublicSearchChange}
        onClear={handleClearPublicSearch}
      />
      <PublicPacksList
        packs={publicPacks}
        loading={publicPacksLoading}
        loadingMore={publicPacksLoadingMore}
        error={publicPacksError}
        hasLoaded={publicLoadedKey !== null}
        searchQuery={activePublicSearch}
        total={publicTotal}
        onLoadMore={handleLoadMorePublic}
        onClearSearch={handleClearPublicSearch}
      />
    </>
  );

  const renderMyPacks = () => {
    if (!sessionReady || myPacksLoading) {
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
          <LoginButtons
            onLogin={handleLogin}
            className={styles.loginButtons}
            cardClassName={styles.loginCard}
          />
        </section>
      );
    }

    if (myPacksError) {
      return <Error detail={myPacksError} />;
    }

    if (myPacks.length === 0) {
      return (
        <div className={styles.emptyState}>
          <img
            className={styles.emptyIcon}
            src="/assets/create_new_pack.svg"
            draggable={false}
            alt=""
            aria-hidden="true"
          />
          <h2 className={styles.emptyTitle}>No packs yet</h2>
          <p className={styles.emptyDescription}>
            Bundle your go-to apps into a single pack — install them all at once
            on any new machine, or share with your team.
          </p>
          <button
            type="button"
            className="button dl accent"
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
        <div className={styles.tabs} role="tablist" aria-label="Pack views">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "mine"}
            className={`${styles.tab} ${activeTab === "mine" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("mine")}
          >
            My Packs
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "public"}
            className={`${styles.tab} ${activeTab === "public" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("public")}
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

export async function getStaticProps() {
  return getDocumentShellStaticProps();
}
