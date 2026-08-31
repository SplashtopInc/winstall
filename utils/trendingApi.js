import fetchWinstallAPI from "./fetchWinstallAPI";
import { normalizeTrendingResponse } from "./trendingData";

async function fetchTrending(path) {
  const { response, error, status } = await fetchWinstallAPI(path);
  const normalized = normalizeTrendingResponse(response);

  return {
    ...normalized,
    error,
    status,
  };
}

export function fetchAppTrending() {
  return fetchTrending("/apps/trending");
}

export function fetchPackTrending() {
  return fetchTrending("/packs/trending");
}
