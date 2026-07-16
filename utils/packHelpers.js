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

    if (existing.versions?.length) {
      merged.versions = existing.versions;
    }

    if (existing.desc) {
      merged.desc = existing.desc;
    }

    if (existing.updatedAt) {
      merged.updatedAt = existing.updatedAt;
    }

    if (existing.likeCount != null) {
      merged.likeCount = existing.likeCount;
    }

    if (existing.publisher) {
      merged.publisher = existing.publisher;
    }

    merged.appVersion =
      existing.appVersion ?? existing.selectedVersion ?? apiApp.latestVersion ?? "";
    merged.selectedVersion =
      existing.selectedVersion ?? existing.appVersion ?? apiApp.latestVersion ?? "";

    if (existing.latestVersion && existing.latestVersion !== merged.appVersion) {
      merged.latestVersion = existing.latestVersion;
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

const OWN_PACKS_KEY = "ownPacks";
const OWN_PACKS_USER_KEY = "ownPacksUserId";

export function writeOwnPacksCache(packs, userId) {
  if (typeof window === "undefined") return;

  localStorage.setItem(OWN_PACKS_KEY, JSON.stringify(packs || []));
  if (userId != null) {
    localStorage.setItem(OWN_PACKS_USER_KEY, String(userId));
  }
}

export async function fetchUserPacks(userId) {
  if (!userId) {
    return { packs: [], error: "Not signed in" };
  }

  const cachedUserId = localStorage.getItem(OWN_PACKS_USER_KEY);
  const cached = localStorage.getItem(OWN_PACKS_KEY);

  if (cached != null && cachedUserId === String(userId)) {
    try {
      return { packs: JSON.parse(cached), fromCache: true };
    } catch {
      invalidateOwnPacksCache();
    }
  } else if (cached != null) {
    // Stale cache from another user (or pre-userId cache).
    invalidateOwnPacksCache();
  }

  const { response, error } = await fetchMyPacks();

  if (error) {
    return { packs: [], error };
  }

  const packs = response || [];
  writeOwnPacksCache(packs, userId);
  return { packs, fromCache: false };
}

export function invalidateOwnPacksCache() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(OWN_PACKS_KEY);
  localStorage.removeItem(OWN_PACKS_USER_KEY);
}

export const OWN_PACKS_UPDATED_EVENT = "winstall:own-packs-updated";
export const PUBLIC_PACKS_UPDATED_EVENT = "winstall:public-packs-updated";

export function notifyPublicPacksChanged() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent(PUBLIC_PACKS_UPDATED_EVENT));
}

export function syncOwnPacksCacheEntry(updatedPack) {
  if (typeof window === "undefined" || !updatedPack?._id) return;

  let wasPublic = false;

  try {
    const cached = localStorage.getItem(OWN_PACKS_KEY);
    if (cached != null) {
      const packs = JSON.parse(cached);
      if (Array.isArray(packs)) {
        const index = packs.findIndex((pack) => pack._id === updatedPack._id);
        if (index >= 0) {
          wasPublic = packs[index].visibility === "public";
        }
        const next =
          index >= 0
            ? packs.map((pack, i) =>
                i === index ? { ...pack, ...updatedPack } : pack
              )
            : [...packs, updatedPack];
        localStorage.setItem(OWN_PACKS_KEY, JSON.stringify(next));
      }
    }
  } catch {
    invalidateOwnPacksCache();
  }

  const isPublic = updatedPack.visibility === "public";
  if (wasPublic || isPublic) {
    notifyPublicPacksChanged();
  }

  window.dispatchEvent(
    new CustomEvent(OWN_PACKS_UPDATED_EVENT, { detail: updatedPack })
  );
}
