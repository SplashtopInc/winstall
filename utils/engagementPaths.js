export const STATS_PATH = /^\/(apps|packs)\/[^/]+\/stats$/;
export const LIKE_PATH = /^\/(apps|packs)\/[^/]+\/like$/;

export function isStatsPath(pathname) {
  return STATS_PATH.test(pathname);
}

export function isLikePath(pathname) {
  return LIKE_PATH.test(pathname);
}
