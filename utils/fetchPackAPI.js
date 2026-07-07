const API_PREFIX = "/api/packs";

/**
 * @param {string} path - path relative to /api/packs
 * @param {RequestInit} [givenOptions]
 * @param {boolean} [throwErr]
 * @returns {Promise<{ response: any, error: string | null }>}
 */
const fetchPackAPI = async (path, givenOptions = {}, throwErr) => {
  const method = givenOptions.method || "GET";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_PREFIX}${normalizedPath}`;
  const timeoutMs = Number(process.env.NEXT_PUBLIC_PACK_API_TIMEOUT_MS || 15000);

  let additionalOptions = { ...givenOptions };
  const headerOptions = { ...additionalOptions.headers };
  delete additionalOptions.headers;

  let response = null;
  let error = null;
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

  return { response, error };
};

export async function fetchMyPacks() {
  return fetchPackAPI("");
}

export async function fetchPublicPacks({ offset, limit, sort, q } = {}) {
  const params = new URLSearchParams();
  if (offset !== undefined) params.set("offset", String(offset));
  if (limit !== undefined) params.set("limit", String(limit));
  if (sort) params.set("sort", sort);
  if (q) params.set("q", q);

  const query = params.toString();
  return fetchPackAPI(query ? `/public?${query}` : "/public");
}

export async function createPack({ name, description, visibility, apps }) {
  return fetchPackAPI("/create", {
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

export default fetchPackAPI;
