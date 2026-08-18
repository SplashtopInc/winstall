import fetchWinstallAPI from "./fetchWinstallAPI";
import { compareVersion } from "./helpers";

/**
 * Static popular/express entries only have {_id, name, img}.
 * When enrichment failed at SSG (e.g. Docker build without API), selection
 * carries that thin object into /generate. Fill basics from the live API.
 */
export function isAppBasicsIncomplete(app) {
  return !app?.desc || !app?.latestVersion || !app?.publisher;
}

export async function ensureAppBasics(app) {
  if (!app?._id || !isAppBasicsIncomplete(app)) {
    return app;
  }

  const { response } = await fetchWinstallAPI(
    `/apps/${app._id}?exclude=versions`
  );

  if (!response) {
    return app;
  }

  const appData = response.data && !response._id ? response.data : response;

  return {
    ...app,
    ...appData,
    _id: app._id,
    img: app.img,
    name: app.name || appData.name,
  };
}

export async function ensureAppsBasics(apps) {
  if (!Array.isArray(apps) || apps.length === 0) return apps;

  return Promise.all(apps.map((app) => ensureAppBasics(app)));
}

export function isAppVersionsMissing(app) {
  return !Array.isArray(app?.versions) || app.versions.length === 0;
}

export async function ensureAppWithVersions(app) {
  if (!app?._id || !isAppVersionsMissing(app)) {
    return app;
  }

  const { response } = await fetchWinstallAPI(`/apps/${app._id}`);
  if (!response) {
    return app;
  }

  const appData = response.data && !response._id ? response.data : response;
  let versions = appData.versions ?? [];
  if (versions.length > 1) {
    versions = [...versions].sort((a, b) =>
      compareVersion(b.version, a.version)
    );
  }

  const latestVersion =
    versions[0]?.version ?? appData.latestVersion ?? app.latestVersion ?? "";
  const savedVersion = app.selectedVersion || app.appVersion || latestVersion;
  const selectedVersion = versions.some((entry) => entry.version === savedVersion)
    ? savedVersion
    : latestVersion;

  return {
    ...app,
    ...appData,
    _id: app._id,
    img: app.img,
    name: app.name || appData.name,
    versions,
    latestVersion,
    selectedVersion,
    installOptions: app.installOptions,
  };
}

export async function ensureAppsWithVersions(apps) {
  if (!Array.isArray(apps) || apps.length === 0) return apps;

  return Promise.all(apps.map((app) => ensureAppWithVersions(app)));
}
