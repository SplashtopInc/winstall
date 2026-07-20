import React, { useContext, useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import SelectedContext from "../ctx/SelectedContext";
import { withRouter } from "next/router";

import {
  FiTrash,
  FiShare,
  FiDownload,
  FiChevronUp,
  FiChevronDown,
  FiX,
} from "react-icons/fi";

import AppIcon from "./AppIcon";
import PackSelectDropdown from "./PackSelectDropdown";
import CreatePackModal from "./CreatePackModal";
import Toast from "./Toast";
import useRequireAuth from "../hooks/useRequireAuth";

import {
  addAppsToPack,
  fetchUserPacks,
  syncOwnPacksCacheEntry,
  writeOwnPacksCache,
} from "../utils/packHelpers";

import barStyles from "../styles/selectionBar.module.scss";

const PREVIEW_ICON_LIMIT = 5;

function SelectionBar({ router }) {
  const { selectedApps, setSelectedApps } = useContext(SelectedContext);
  const { data: session } = useSession();

  const [hideCreatePack, setHideCreatePack] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [packs, setPacks] = useState([]);
  const [loadingPacks, setLoadingPacks] = useState(false);
  const [packsError, setPacksError] = useState("");
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState(null);
  const addToPackRef = useRef(null);
  const barContainerRef = useRef(null);

  useEffect(() => {
    if (router.pathname === "/packs/create") {
      setHideCreatePack(true);
    } else {
      setHideCreatePack(false);
    }
  }, [router]);

  useEffect(() => {
    if (selectedApps.length === 0) {
      setExpanded(false);
    }
  }, [selectedApps.length]);

  useEffect(() => {
    setPacks([]);
    setPacksError("");
    setDropdownOpen(false);
    setShowCreateModal(false);
  }, [session?.user?.id]);

  useEffect(() => {
    if (!expanded) return;

    const handleClickOutside = (event) => {
      if (
        barContainerRef.current &&
        !barContainerRef.current.contains(event.target)
      ) {
        setExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expanded]);

  const loadPacks = useCallback(async () => {
    if (!session?.user?.id) return;

    setLoadingPacks(true);
    setPacksError("");

    const { packs: userPacks, error } = await fetchUserPacks(session.user.id);

    setLoadingPacks(false);

    if (error) {
      setPacksError(error);
      setPacks([]);
      return;
    }

    setPacks(userPacks);
  }, [session?.user?.id]);

  const openDropdown = useCallback(async () => {
    setDropdownOpen(true);
    await loadPacks();
  }, [loadPacks]);

  const { requireAuth } = useRequireAuth({
    resumeKey: "addToPack",
    onSuccess: openDropdown,
    beforeSignIn: () => {
      localStorage.setItem("winstallLogin", JSON.stringify(selectedApps));
    },
    callbackUrl: router.asPath,
  });

  const finishAddToPack = useCallback(
    (packName, error, updatedPack) => {
      setAdding(false);

      if (error) {
        setToast({ type: "error", message: error });
        return;
      }

      if (updatedPack) {
        syncOwnPacksCacheEntry(updatedPack);
      }
      setToast({
        type: "success",
        message: `Added to ${packName}`,
      });
      setSelectedApps([]);
      setExpanded(false);
      setDropdownOpen(false);
    },
    [setSelectedApps]
  );

  const handleAddAppsToPack = useCallback(
    async (pack) => {
      if (!selectedApps.length) return;

      setAdding(true);
      const packName = pack.name || "pack";
      const { response, error } = await addAppsToPack(
        pack._id,
        pack.apps,
        selectedApps
      );
      finishAddToPack(packName, error, response);
    },
    [selectedApps, finishAddToPack]
  );

  useEffect(() => {
    const backup = localStorage.getItem("winstallLogin");
    if (backup) {
      try {
        const apps = JSON.parse(backup);
        if (Array.isArray(apps) && apps.length > 0) {
          setSelectedApps(apps);
        }
        localStorage.removeItem("winstallLogin");
      } catch {
        localStorage.removeItem("winstallLogin");
      }
    }
  }, [setSelectedApps]);

  const previewApps = selectedApps.slice(0, PREVIEW_ICON_LIMIT);
  const overflowCount =
    selectedApps.length > PREVIEW_ICON_LIMIT
      ? selectedApps.length - PREVIEW_ICON_LIMIT
      : 0;

  const handleClear = () => {
    if ("confirm" in window && typeof window.confirm === "function") {
      if (
        window.confirm("Are you sure you want to unselect all the apps?")
      ) {
        setSelectedApps([]);
        setExpanded(false);
      }
    } else {
      setSelectedApps([]);
      setExpanded(false);
    }
  };

  const handleClearAll = () => {
    setSelectedApps([]);
    setExpanded(false);
  };

  const handleRemoveApp = (appId) => {
    setSelectedApps(selectedApps.filter((app) => app._id !== appId));
  };

  const handleAddToPackClick = () => {
    requireAuth();
  };

  const handlePackCreated = async (newPack) => {
    const pack = { ...newPack, apps: newPack.apps || [] };
    setShowCreateModal(false);
    setPacks((current) => {
      const updated = [...current, pack];
      writeOwnPacksCache(updated, session?.user?.id);
      return updated;
    });

    if (!selectedApps.length) return;

    setAdding(true);
    const packName = pack.name || "pack";
    const { response, error } = await addAppsToPack(pack._id, pack.apps, selectedApps);
    finishAddToPack(packName, error, response);

    if (!error) {
      router.push(`/packs/${pack._id}`);
    }
  };

  const selectionLabel = `Selected ${selectedApps.length} ${
    selectedApps.length === 1 ? "app" : "apps"
  } so far`;

  return (
    <>
      {selectedApps.length > 0 && (
      <div className={barStyles.wrapper}>
        <div className={barStyles.barContainer} ref={barContainerRef}>
          <div
            className={`${barStyles.selectionCard} ${
              expanded ? barStyles.selectionCardExpanded : ""
            }`}
          >
            {expanded && (
              <div className={barStyles.expandedPanel}>
                <div className={barStyles.expandedHeader}>
                  <h2>{selectionLabel}</h2>
                  <button
                    type="button"
                    className={barStyles.clearAllBtn}
                    onClick={handleClearAll}
                  >
                    Clear all
                  </button>
                </div>
                <div className={barStyles.expandedGrid}>
                  {selectedApps.map((app) => (
                    <div key={app._id} className={barStyles.expandedItem}>
                      <div className={barStyles.expandedIcon}>
                        <AppIcon
                          id={app._id}
                          name={app.name}
                          icon={app.icon}
                          iconUrl={app.iconUrl}
                          iconPng={app.iconPng}
                        />
                      </div>
                      <span className={barStyles.appName}>{app.name}</span>
                      <button
                        type="button"
                        className={barStyles.removeBtn}
                        onClick={() => handleRemoveApp(app._id)}
                        title={`Remove ${app.name}`}
                        aria-label={`Remove ${app.name}`}
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={`bottomBar ${barStyles.bar}`}>
              <div className={`inner ${barStyles.inner}`}>
                <button
                  type="button"
                  className={barStyles.previewToggle}
                  onClick={() => setExpanded((open) => !open)}
                  aria-expanded={expanded}
                >
                  <div className={barStyles.thumbnails}>
                    {previewApps.map((app) => (
                      <div key={app._id} className={barStyles.thumbnail}>
                        <AppIcon
                          id={app._id}
                          name={app.name}
                          icon={app.icon}
                          iconUrl={app.iconUrl}
                          iconPng={app.iconPng}
                        />
                      </div>
                    ))}
                    {overflowCount > 0 && (
                      <span className={barStyles.overflowBadge}>
                        +{overflowCount}
                      </span>
                    )}
                  </div>
                  <div className={barStyles.previewText}>
                    <span className={barStyles.previewTitle}>
                      {selectionLabel}
                      <span className={barStyles.chevron}>
                        {expanded ? <FiChevronDown /> : <FiChevronUp />}
                      </span>
                    </span>
                    <span className={barStyles.previewHint}>
                      {expanded ? "Click to collapse" : "Click to view & edit"}
                    </span>
                  </div>
                </button>

                <div className="controls">
                  <button
                    className="clear small"
                    onClick={() => handleClear()}
                    title="Clear selections"
                  >
                    <FiTrash />
                  </button>
                  <Link href="/generate">
                    <button>
                      <FiDownload />
                      Install
                    </button>
                  </Link>
                  {!hideCreatePack && (
                    <div className={barStyles.addToPackWrapper} ref={addToPackRef}>
                      <button type="button" onClick={handleAddToPackClick}>
                        <FiShare />
                        <em>Add to Pack</em>
                      </button>

                      <PackSelectDropdown
                        isOpen={dropdownOpen}
                        onClose={() => setDropdownOpen(false)}
                        packs={packs}
                        loading={loadingPacks}
                        adding={adding}
                        error={packsError}
                        onSelectPack={handleAddAppsToPack}
                        anchorRef={addToPackRef}
                        onCreateNew={() => {
                          setDropdownOpen(false);
                          setShowCreateModal(true);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {session?.user && (
        <CreatePackModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          user={session.user}
          onCreated={handlePackCreated}
        />
      )}

      <Toast
        message={toast?.message}
        type={toast?.type}
        onDismiss={() => setToast(null)}
      />
    </>
  );
}

export default withRouter(SelectionBar);
