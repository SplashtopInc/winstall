import fetchWinstallAPI from "./fetchWinstallAPI";
import { getRuntimeConfig } from "./runtimeConfig";
import { signJwt } from "./signJwt";

/**
 * Paginate GET /packs until exhausted or maxPages.
 * @param {{ limit?: number, sort?: string, maxPages?: number }} [options]
 * @returns {Promise<{ packs: any[], error: string | null }>}
 */
export async function fetchAllPublicPacksFromApi({
  limit = 100,
  sort = "recent",
  maxPages = 50,
} = {}) {
  const packs = [];
  let offset = 0;
  let total = Infinity;

  for (let page = 0; page < maxPages && offset < total; page += 1) {
    const { response, error } = await fetchWinstallAPI(
      `/packs?offset=${offset}&limit=${limit}&sort=${encodeURIComponent(sort)}`
    );

    if (error || !response) {
      return { packs, error: error || "Failed to load public packs" };
    }

    const batch = Array.isArray(response.data) ? response.data : [];
    packs.push(...batch);
    total =
      typeof response.total === "number" ? response.total : packs.length;
    offset += limit;

    if (batch.length === 0) {
      break;
    }
  }

  return { packs, error: null };
}

/**
 * List current user's packs then delete each on the API (account deletion cascade).
 * @param {string} userId - session publicId
 */
export async function deleteUserPacksViaApi(userId) {
  const config = await getRuntimeConfig();
  if (!config.apiBase) {
    throw new Error("API base URL not configured");
  }

  const token = userId ? signJwt({ userId }) : null;
  if (!token) {
    throw new Error("Unable to sign user JWT for pack deletion");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const listUrl = `${config.apiBase.replace(/\/$/, "")}/packs/me`;
  const listRes = await fetch(listUrl, { headers });
  const listText = await listRes.text();
  let packs = [];

  if (!listRes.ok) {
    let errMsg = listText || "Failed to list user packs";
    try {
      const parsed = JSON.parse(listText);
      errMsg = parsed.error || parsed.message || errMsg;
    } catch {
      // keep errMsg
    }
    throw new Error(errMsg);
  }

  if (listText) {
    try {
      const parsed = JSON.parse(listText);
      packs = Array.isArray(parsed) ? parsed : parsed.data || [];
    } catch {
      throw new Error("Failed to parse packs/me response");
    }
  }

  for (const pack of packs) {
    const packId = pack?._id;
    if (!packId) continue;

    const delRes = await fetch(
      `${config.apiBase.replace(/\/$/, "")}/packs/${encodeURIComponent(packId)}`,
      {
        method: "DELETE",
        headers,
      }
    );

    if (!delRes.ok) {
      const errText = await delRes.text();
      console.error(
        `[deleteUserPacksViaApi] Failed to delete pack ${packId}:`,
        errText
      );
      throw new Error(`Failed to delete pack ${packId}`);
    }
  }

  return { deleted: packs.length };
}
