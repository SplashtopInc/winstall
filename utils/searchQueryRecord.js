const STORAGE_KEY = "winstall.pendingSearchRecord";
const RECORD_TTL_MS = 30 * 1000;

function defaultStorage() {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage;
}

function resultsQuery(path) {
  const raw = String(path ?? "");
  const hash = raw.indexOf("#");
  const withoutHash = hash === -1 ? raw : raw.slice(0, hash);
  const queryIndex = withoutHash.indexOf("?");
  const pathname = (queryIndex === -1 ? withoutHash : withoutHash.slice(0, queryIndex)).replace(/\/$/, "") || "/";
  if (pathname !== "/apps") return null;
  const search = queryIndex === -1 ? "" : withoutHash.slice(queryIndex + 1);
  const query = new URLSearchParams(search).get("q");
  return query == null ? "" : query.trim();
}

/**
 * Store a one-shot search record when the next results URL differs.
 * @returns {boolean} whether a mark was written
 */
export function armSearchRecord({
  currentPath,
  nextPath,
  text,
  now = Date.now(),
  storage,
} = {}) {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return false;

  const nextQuery = resultsQuery(nextPath);
  if (nextQuery == null) return false;
  const currentQuery = resultsQuery(currentPath);
  if (currentQuery != null && currentQuery === nextQuery) return false;

  const store = storage || defaultStorage();
  if (!store) return false;

  try {
    store.setItem(
      STORAGE_KEY,
      JSON.stringify({ text: trimmed, expiresAt: now + RECORD_TTL_MS })
    );
  } catch {
    return false;
  }
  return true;
}

/**
 * Read and delete the pending mark. True only when it is unexpired and matches.
 * @returns {boolean}
 */
export function consumeSearchRecord({ pageQuery, now = Date.now(), storage } = {}) {
  const store = storage || defaultStorage();
  if (!store) return false;

  let raw = null;
  try {
    raw = store.getItem(STORAGE_KEY);
    store.removeItem(STORAGE_KEY);
  } catch {
    return false;
  }
  if (!raw) return false;

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return false;
  }
  if (!parsed || typeof parsed.text !== "string" || typeof parsed.expiresAt !== "number") {
    return false;
  }
  if (parsed.expiresAt <= now) return false;
  return parsed.text === String(pageQuery ?? "").trim();
}

/**
 * Headers for one marked GET /apps/search. Expired or missing JWTs are omitted.
 * @returns {Record<string, string>}
 */
export function searchRecordHeaders({
  recordSearch = false,
  apiToken,
  apiTokenExpires,
  now = Date.now(),
} = {}) {
  if (!recordSearch) return {};

  const headers = { "X-Search-Record": "1" };
  const exp = Number(apiTokenExpires) || 0;
  if (apiToken && exp - Math.floor(now / 1000) > 0) {
    headers.Authorization = `Bearer ${apiToken}`;
  }
  return headers;
}
