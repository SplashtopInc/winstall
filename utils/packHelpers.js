import { fetchMyPacks, updatePack } from "./fetchPackAPI";
import {
  hasInstallOptions,
  normalizeInstallOptions,
} from "./installOptions";

function getAppId(app) {
  return app?.appId || app?._id;
}

export function isAppUnavailable({ response, status, error } = {}) {
  if (status === 404 || status === 410) {
    return true;
  }

  if (response?.deleted === true || response?.status === "deleted") {
    return true;
  }

  if (error && /could not find app|not found/i.test(String(error))) {
    return true;
  }

  return false;
}

export function toAppSnapshot(app) {
  const appId = getAppId(app);
  if (!appId) return null;

  const snapshot = {
    appId,
    appName: app.appName ?? app.name ?? "",
    appVersion: app.appVersion ?? app.latestVersion ?? "",
    icon: app.icon,
    publisher: app.publisher,
  };

  const installOptions = normalizeInstallOptions(app.installOptions);
  if (hasInstallOptions(installOptions)) {
    snapshot.installOptions = installOptions;
  }

  return snapshot;
}

export function mergePackApps(existingApps = [], newApps = []) {
  const seen = new Set(
    (existingApps || []).map(getAppId).filter(Boolean)
  );
  const merged = [...(existingApps || [])];

  for (const app of newApps) {
    const id = getAppId(app);
    if (!id || seen.has(id)) continue;
    merged.push(app);
    seen.add(id);
  }

  return merged;
}

export function formatAppsForPatch(apps) {
  return apps.map(toAppSnapshot).filter(Boolean);
}

export function mergeAppsWithEnrichedData(existingApps = [], apiApps = []) {
  const existingById = new Map(
    existingApps.map((app) => [getAppId(app), app]).filter(([id]) => id)
  );

  return apiApps.map((apiApp) => {
    const existing = existingById.get(getAppId(apiApp));
    if (!existing) return apiApp;
    const merged = { ...existing, ...apiApp };
    if (existing.unavailable) {
      merged.unavailable = true;
    }
    return merged;
  });
}

export async function addAppsToPack(packId, existingApps, newApps) {
  const merged = mergePackApps(existingApps, newApps);
  const apps = formatAppsForPatch(merged);

  return updatePack(packId, { apps });
}

export function removeAppFromPackApps(existingApps = [], appIdToRemove) {
  return (existingApps || []).filter(
    (app) => getAppId(app) !== appIdToRemove
  );
}

export async function removeAppFromPack(packId, existingApps, appIdToRemove) {
  const remaining = removeAppFromPackApps(existingApps, appIdToRemove);
  const apps = formatAppsForPatch(remaining);

  return updatePack(packId, { apps });
}

export async function fetchUserPacks() {
  const cached = localStorage.getItem("ownPacks");
  if (cached != null) {
    try {
      return { packs: JSON.parse(cached), fromCache: true };
    } catch {
      localStorage.removeItem("ownPacks");
    }
  }

  const { response, error } = await fetchMyPacks();

  if (error) {
    return { packs: [], error };
  }

  const packs = response || [];
  localStorage.setItem("ownPacks", JSON.stringify(packs));
  return { packs, fromCache: false };
}

export function invalidateOwnPacksCache() {
  localStorage.removeItem("ownPacks");
}

export const OWN_PACKS_UPDATED_EVENT = "winstall:own-packs-updated";

export function syncOwnPacksCacheEntry(updatedPack) {
  if (typeof window === "undefined" || !updatedPack?._id) return;

  try {
    const cached = localStorage.getItem("ownPacks");
    if (cached != null) {
      const packs = JSON.parse(cached);
      if (Array.isArray(packs)) {
        const index = packs.findIndex((pack) => pack._id === updatedPack._id);
        const next =
          index >= 0
            ? packs.map((pack, i) =>
                i === index ? { ...pack, ...updatedPack } : pack
              )
            : [...packs, updatedPack];
        localStorage.setItem("ownPacks", JSON.stringify(next));
      }
    }
  } catch {
    localStorage.removeItem("ownPacks");
  }

  window.dispatchEvent(
    new CustomEvent(OWN_PACKS_UPDATED_EVENT, { detail: updatedPack })
  );
}
