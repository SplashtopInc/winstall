/**
 * Google Tag Manager dataLayer helpers.
 * Event names, payload fields, and enum values live in one registry.
 * Page call sites are wired in a follow-up change.
 */

const SEARCH_TERM_MAX = 300;

export const GTM_EVENT = {
  pageLoaded: "ws_page_loaded",
  search: "ws_search",
  appInstall: "ws_app_install",
  packInstall: "ws_pack_install",
  share: "ws_share",
  adClick: "ws_ad_click",
};

export const GTM_FIELD = {
  searchTerm: "search_term",
  resultCount: "result_count",
  appId: "app_id",
  commandType: "command_type",
  hasVersion: "has_version",
  installFormat: "install_format",
  installAction: "install_action",
  appCount: "app_count",
  packId: "pack_id",
  shareType: "share_type",
  shareChannel: "share_channel",
  adId: "ad_id",
  adPlacement: "ad_placement",
  adProduct: "ad_product",
  pagePath: "page_path",
  pageLocation: "page_location",
  pageTitle: "page_title",
};

export const GTM_VALUE = {
  commandType: {
    install: "install",
    upgrade: "upgrade",
  },
  installFormat: {
    command: "command",
    installer: "installer",
    bat: "bat",
    ps1: "ps1",
    json: "json",
  },
  installAction: {
    download: "download",
    copy: "copy",
  },
  packId: {
    generate: "generate",
  },
  shareType: {
    app: "app",
    pack: "pack",
  },
  shareChannel: {
    link: "link",
    badge: "badge",
    x: "x",
    facebook: "facebook",
    linkedin: "linkedin",
  },
  adPlacement: {
    homeCarousel: "home-carousel",
    appsList: "apps-list",
    appDetail: "app-detail",
    packList: "pack-list",
  },
};

const INSTALL_ACTIONS = new Set(Object.values(GTM_VALUE.installAction));
const APP_INSTALL_FORMATS = new Set([
  GTM_VALUE.installFormat.command,
  GTM_VALUE.installFormat.installer,
]);
const PACK_INSTALL_FORMATS = new Set([
  GTM_VALUE.installFormat.installer,
  GTM_VALUE.installFormat.bat,
  GTM_VALUE.installFormat.ps1,
  GTM_VALUE.installFormat.json,
]);
const SHARE_TYPES = new Set(Object.values(GTM_VALUE.shareType));
const SHARE_CHANNELS = new Set(Object.values(GTM_VALUE.shareChannel));
const AD_PLACEMENTS = new Set(Object.values(GTM_VALUE.adPlacement));
const COMMAND_TYPES = new Set(Object.values(GTM_VALUE.commandType));

function hasAnalyticsConsent() {
  return window.Osano?.cm?.analytics === true;
}

function canPush() {
  return typeof window !== "undefined" && window.dataLayer && hasAnalyticsConsent();
}

function pagePath(url) {
  const raw = typeof url === "string" && url ? url : window.location.pathname;
  const path = raw.split("#")[0].split("?")[0];
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

function clearedFields() {
  const cleared = { event: undefined };
  for (const key of Object.values(GTM_FIELD)) cleared[key] = undefined;
  return cleared;
}

function pushGtmEvent(event, params) {
  if (!canPush()) return;
  window.dataLayer.push(clearedFields());
  window.dataLayer.push({
    event,
    [GTM_FIELD.pagePath]: pagePath(),
    ...params,
  });
}

function trimmedSearchTerm(searchTerm) {
  return String(searchTerm ?? "").trim().slice(0, SEARCH_TERM_MAX);
}

function finiteCount(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

/**
 * Push a page view after a client route change.
 * @param {string} url - Route path. Query and hash are omitted from page_path.
 */
export const trackPageLoaded = (url) => {
  if (!canPush()) return;
  window.dataLayer.push(clearedFields());
  window.dataLayer.push({
    event: GTM_EVENT.pageLoaded,
    [GTM_FIELD.pageLocation]: window.location.href,
    [GTM_FIELD.pagePath]: pagePath(url),
    [GTM_FIELD.pageTitle]: document.title,
  });
};

/**
 * @param {{ searchTerm: string, resultCount?: number }} input
 */
export function trackSearch({ searchTerm, resultCount } = {}) {
  const term = trimmedSearchTerm(searchTerm);
  if (!term) return;

  const params = { [GTM_FIELD.searchTerm]: term };
  if (finiteCount(resultCount)) params[GTM_FIELD.resultCount] = resultCount;
  pushGtmEvent(GTM_EVENT.search, params);
}

/**
 * App detail only. Generate-page installs use trackPackInstall with GTM_VALUE.packId.generate.
 * @param {{
 *   installAction: "copy" | "download",
 *   installFormat: "command" | "installer",
 *   commandType: "install" | "upgrade",
 *   appId: string,
 *   hasVersion?: boolean,
 * }} input
 */
export function trackAppInstall({
  installAction,
  installFormat,
  commandType,
  appId,
  hasVersion,
} = {}) {
  if (!INSTALL_ACTIONS.has(installAction)) return;
  if (!APP_INSTALL_FORMATS.has(installFormat)) return;
  if (!COMMAND_TYPES.has(commandType)) return;
  if (!appId) return;
  if (installFormat !== GTM_VALUE.installFormat.command && commandType !== GTM_VALUE.commandType.install) {
    return;
  }

  const params = {
    [GTM_FIELD.installAction]: installAction,
    [GTM_FIELD.installFormat]: installFormat,
    [GTM_FIELD.commandType]: commandType,
    [GTM_FIELD.appCount]: 1,
    [GTM_FIELD.appId]: String(appId),
  };
  if (installFormat === GTM_VALUE.installFormat.command) {
    params[GTM_FIELD.hasVersion] = Boolean(hasVersion);
  }
  pushGtmEvent(GTM_EVENT.appInstall, params);
}

/**
 * Pack drawer and the generate page. Pass GTM_VALUE.packId.generate for /generate.
 * @param {{
 *   installAction: "copy" | "download",
 *   installFormat: "installer" | "bat" | "ps1" | "json",
 *   appCount: number,
 *   packId: string,
 * }} input
 */
export function trackPackInstall({
  installAction,
  installFormat,
  appCount,
  packId,
} = {}) {
  if (!INSTALL_ACTIONS.has(installAction)) return;
  if (!PACK_INSTALL_FORMATS.has(installFormat)) return;
  if (!finiteCount(appCount) || appCount < 1) return;
  if (typeof packId !== "string" || !packId.trim()) return;
  pushGtmEvent(GTM_EVENT.packInstall, {
    [GTM_FIELD.installAction]: installAction,
    [GTM_FIELD.installFormat]: installFormat,
    [GTM_FIELD.commandType]: GTM_VALUE.commandType.install,
    [GTM_FIELD.appCount]: appCount,
    [GTM_FIELD.packId]: packId.trim(),
  });
}

/**
 * @param {{
 *   shareType: "app" | "pack",
 *   targetId: string,
 *   shareChannel: "link" | "badge" | "x" | "facebook" | "linkedin",
 * }} input
 */
export function trackShare({ shareType, targetId, shareChannel } = {}) {
  if (!targetId || !SHARE_TYPES.has(shareType) || !SHARE_CHANNELS.has(shareChannel)) return;
  const params = {
    [GTM_FIELD.shareType]: shareType,
    [GTM_FIELD.shareChannel]: shareChannel,
  };
  if (shareType === GTM_VALUE.shareType.app) {
    params[GTM_FIELD.appId] = String(targetId);
  } else {
    params[GTM_FIELD.packId] = String(targetId);
  }
  pushGtmEvent(GTM_EVENT.share, params);
}

/**
 * @param {{ adId: string, adPlacement: string, adProduct?: string }} input
 */
export function trackAdClick({ adId, adPlacement, adProduct } = {}) {
  if (!adId || !AD_PLACEMENTS.has(adPlacement)) return;
  pushGtmEvent(GTM_EVENT.adClick, {
    [GTM_FIELD.adId]: String(adId),
    [GTM_FIELD.adPlacement]: adPlacement,
    [GTM_FIELD.adProduct]: adProduct ? String(adProduct) : String(adId),
  });
}
