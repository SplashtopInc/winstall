import { isPackApiViaWinstall } from "./packApiConfig";

/**
 * @param {string} path - path relative to pack base (may start with / or ?)
 * @param {RequestInit} [givenOptions]
 * @param {boolean} [throwErr]
 * @returns {Promise<{ response: any, error: string | null, status: number | null }>}
 */
const fetchPackAPI = async (path, givenOptions = {}, throwErr) => {
  const method = givenOptions.method || "GET";
  const base = isPackApiViaWinstall()
    ? "/api/winstall/packs"
    : "/api/packs";
  const rawPath = path == null ? "" : String(path);
  const url = rawPath.startsWith("?")
    ? `${base}${rawPath}`
    : `${base}${rawPath.startsWith("/") ? rawPath : rawPath ? `/${rawPath}` : ""}`;
  const timeoutMs = Number(process.env.NEXT_PUBLIC_PACK_API_TIMEOUT_MS || 15000);

  let additionalOptions = { ...givenOptions };
  const headerOptions = { ...additionalOptions.headers };
  delete additionalOptions.headers;

  let response = null;
  let error = null;
  let status = null;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers = {
      "Content-Type": "application/json",
      ...headerOptions,
    };

    const res = await fetch(url, {
      ...additionalOptions,
      method,
      headers,
      credentials: "same-origin",
      redirect: "follow",
      signal: controller.signal,
    });

    status = res.status;

    if (!res.ok) {
      let errorBody;

      try {
        errorBody = await res.json();
        error = errorBody.error || errorBody.message || res.statusText;
      } catch {
        error = res.statusText;
      }

      if (throwErr) {
        throw new Error(error);
      }
    } else {
      response = await res.json();
    }
  } catch (err) {
    const errName = err?.name || "Error";
    error =
      errName === "AbortError"
        ? `Request timed out after ${timeoutMs}ms`
        : err.message;

    if (throwErr) {
      throw new Error(error);
    }
  } finally {
    clearTimeout(timeoutId);
  }

  return { response, error, status };
};

export async function fetchMyPacks() {
  if (isPackApiViaWinstall()) {
    return fetchPackAPI("/me");
  }
  return fetchPackAPI("");
}

export async function fetchPublicPacks({ offset, limit, sort, q } = {}) {
  const params = new URLSearchParams();
  if (offset !== undefined) params.set("offset", String(offset));
  if (limit !== undefined) params.set("limit", String(limit));
  if (sort) params.set("sort", sort);
  if (q) params.set("q", q);

  const query = params.toString();

  if (isPackApiViaWinstall()) {
    return fetchPackAPI(query ? `?${query}` : "");
  }

  return fetchPackAPI(query ? `/public?${query}` : "/public");
}

export async function createPack({ name, description, visibility, apps }) {
  const body = JSON.stringify({ name, description, visibility, apps });
  if (isPackApiViaWinstall()) {
    return fetchPackAPI("", {
      method: "POST",
      body,
    });
  }
  return fetchPackAPI("/create", {
    method: "POST",
    body,
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

/**
 * Lifetime PackStats from API (view/download/like). Prefer this over embedded pack.stats.
 */
export async function fetchPackStats(id) {
  if (isPackApiViaWinstall()) {
    return fetchPackAPI(`/${id}/stats`);
  }
  // Local Pack documents may still embed stats; no dedicated stats GET on local API.
  const { response, error, status } = await fetchPackById(id);
  if (error || !response) {
    return { response: null, error, status };
  }
  return {
    response: response.stats || {
      viewCount: 0,
      downloadCount: 0,
      likeCount: 0,
    },
    error: null,
    status,
  };
}

export default fetchPackAPI;
