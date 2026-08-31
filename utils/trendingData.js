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
    likes: Number(item?.likes) || 0,
    downloads: Number(item?.downloads) || 0,
    views: Number(item?.views) || 0,
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
