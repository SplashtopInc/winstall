/**
 * Catalog tip is versions[0] (API order). Do not re-sort.
 */
export function getCatalogLatestVersion(app) {
  const versions = app?.versions;
  if (Array.isArray(versions) && versions.length > 0) {
    return versions[0]?.version || "";
  }
  return app?.latestVersion || "";
}

/** Missing, null, or blank string → unpinned. */
export function normalizeAppVersionPin(appVersion) {
  if (appVersion == null) return "";
  return String(appVersion).trim();
}

/**
 * Pack appVersion pin rules:
 * - empty → display versions[0], no install pin
 * - in versions[] → display + pin that value (even if === versions[0])
 * - not in non-empty versions[] → fall back to versions[0], no install pin
 * - no versions[] → trust non-empty appVersion
 */
export function resolvePackAppVersion(app) {
  const pin = normalizeAppVersionPin(app?.appVersion);
  const versions = Array.isArray(app?.versions) ? app.versions : [];
  const catalogLatest = getCatalogLatestVersion(app);

  if (!pin) {
    return { displayVersion: catalogLatest, pinnedVersion: "" };
  }

  if (versions.length === 0) {
    return { displayVersion: pin, pinnedVersion: pin };
  }

  const inList = versions.some((entry) => entry?.version === pin);
  if (inList) {
    return { displayVersion: pin, pinnedVersion: pin };
  }

  return { displayVersion: catalogLatest, pinnedVersion: "" };
}

/**
 * Version for winget `-v` / installer payload.
 * Pack apps (own `appVersion` key, including "") use pack pin rules.
 * Generate apps omit `-v` when selected === catalog tip.
 */
export function getPinnedInstallVersion(app) {
  if (Object.prototype.hasOwnProperty.call(app || {}, "appVersion")) {
    const { pinnedVersion } = resolvePackAppVersion(app);
    return pinnedVersion || undefined;
  }

  const selected = app?.selectedVersion || "";
  if (!selected) return undefined;

  const catalogLatest = getCatalogLatestVersion(app);
  if (catalogLatest && selected === catalogLatest) return undefined;
  return selected;
}
