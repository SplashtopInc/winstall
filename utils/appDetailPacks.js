export const APP_DETAIL_PACK_LIMIT = 4;

export function appDetailPacksPath(appId) {
  return `/apps/${encodeURIComponent(appId)}/packs?limit=${APP_DETAIL_PACK_LIMIT}`;
}

export function readAppDetailPacks(response) {
  if (!Array.isArray(response?.data)) return [];
  return response.data.slice(0, APP_DETAIL_PACK_LIMIT);
}

export function appDetailPackCountLabel(appCount) {
  if (!Number.isInteger(appCount) || appCount < 0) return "0 apps";
  if (appCount === 1) return "1 app";
  return `${appCount} apps`;
}
