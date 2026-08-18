import fetchWinstallAPI from "./fetchWinstallAPI";
import { mapStatsPayload } from "./engagementStats";

export { formatCount, mapStatsPayload } from "./engagementStats";

async function fetchStats(path) {
  const { response, error, status } = await fetchWinstallAPI(path);
  return { stats: error ? null : mapStatsPayload(response), error, status };
}

export async function fetchAppStats(id) {
  return fetchStats(`/apps/${encodeURIComponent(id)}/stats`);
}

export async function fetchPackStats(id) {
  return fetchStats(`/packs/${encodeURIComponent(id)}/stats`);
}

/**
 * @param {"app" | "pack"} targetType
 * @param {string} targetId
 * @param {boolean} liked - desired liked state
 */
export async function setResourceLike(targetType, targetId, liked) {
  const base = targetType === "pack" ? "packs" : "apps";
  const { response, error, status } = await fetchWinstallAPI(
    `/${base}/${encodeURIComponent(targetId)}/like`,
    {
      method: liked ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (status === 409 && liked) {
    return {
      like: { liked: true, likeCount: Number(response?.likeCount) || null },
      error: null,
      status,
    };
  }

  if (error || !response) {
    return { like: null, error, status };
  }

  return {
    like: {
      liked: response.liked === true,
      likeCount: Number(response.likeCount) || 0,
    },
    error: null,
    status,
  };
}
