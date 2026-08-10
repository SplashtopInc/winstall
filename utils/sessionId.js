const STORAGE_KEY = "winstall_session_id";

/** @type {string | null | undefined} */
let memoryCache;

/**
 * Stable browser session id for analytics view dedupe.
 * Survives refresh; does not change on logout. SSR-safe (returns null).
 */
export function getSessionId() {
  if (typeof window === "undefined") {
    return null;
  }

  if (memoryCache) {
    return memoryCache;
  }

  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) {
      memoryCache = existing;
      return existing;
    }

    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

    window.localStorage.setItem(STORAGE_KEY, id);
    memoryCache = id;
    return id;
  } catch {
    return null;
  }
}
