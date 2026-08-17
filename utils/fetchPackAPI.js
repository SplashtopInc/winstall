import fetchWinstallAPI from "./fetchWinstallAPI";

/**
 * @param {string} path - path relative to pack base (may start with / or ?)
 * @param {RequestInit} [givenOptions]
 * @param {boolean} [throwErr]
 * @returns {Promise<{ response: any, error: string | null, status: number | null }>}
 */
const fetchPackAPI = async (path, givenOptions = {}, throwErr) => {
  const rawPath = path == null ? "" : String(path);
  const apiPath = rawPath.startsWith("?")
    ? `/packs${rawPath}`
    : `/packs${rawPath.startsWith("/") ? rawPath : rawPath ? `/${rawPath}` : ""}`;

  return fetchWinstallAPI(
    apiPath,
    {
      ...givenOptions,
      headers: {
        "Content-Type": "application/json",
        ...givenOptions.headers,
      },
    },
    throwErr
  );
};

export async function fetchMyPacks() {
  return fetchPackAPI("/me");
}

export async function fetchPublicPacks({ offset, limit, sort, q } = {}) {
  const params = new URLSearchParams();
  if (offset !== undefined) params.set("offset", String(offset));
  if (limit !== undefined) params.set("limit", String(limit));
  if (sort) params.set("sort", sort);
  if (q) params.set("q", q);

  const query = params.toString();
  return fetchPackAPI(query ? `?${query}` : "");
}

export async function createPack({ name, description, visibility, apps }) {
  return fetchPackAPI("", {
    method: "POST",
    body: JSON.stringify({ name, description, visibility, apps }),
  });
}

export async function updatePack(id, patch) {
  return fetchPackAPI(`/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function deletePack(id) {
  return fetchPackAPI(`/${id}`, {
    method: "DELETE",
  });
}

export async function fetchPackById(id) {
  return fetchPackAPI(`/${id}`);
}

export async function copyPack(id) {
  return fetchPackAPI(`/${id}/copy`, {
    method: "POST",
  });
}

export async function fetchPackStats(id) {
  return fetchPackAPI(`/${id}/stats`);
}

export default fetchPackAPI;
