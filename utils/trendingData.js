const TRENDING_PATHS = new Set(["/apps/trending", "/packs/trending"]);

export function isTrendingPath(pathname) {
  return TRENDING_PATHS.has(pathname);
}

export function normalizeTrendingResponse(response) {
  return {
    generatedAt: response?.generatedAt || null,
    items: Array.isArray(response?.data) ? response.data : [],
  };
}

export function readTrendingCounts(item) {
  return {
    viewCount: Number(item?.viewCount) || 0,
    downloadCount: Number(item?.downloadCount) || 0,
    likeCount: Number(item?.likeCount) || 0,
  };
}

export function normalizeTrendingPack(pack) {
  return {
    ...pack,
    title: pack?.title || pack?.name || "",
    desc: pack?.desc || pack?.description || "",
    apps: Array.isArray(pack?.apps)
      ? pack.apps.map((app) => ({
          ...app,
          _id: app._id || app.appId,
          name: app.name || app.appName || "",
        }))
      : [],
  };
}

export function getTopTrendingPack(packs) {
  if (!Array.isArray(packs) || packs.length === 0) return null;

  const sorted = [...packs].sort(
    (first, second) => Number(first.rank) - Number(second.rank)
  );

  return normalizeTrendingPack(sorted[0]);
}
