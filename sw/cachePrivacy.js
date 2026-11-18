// Pure helpers for the service worker cache privacy rules.
// Keep this file free of `self` and other worker globals so node --test can load it.

/**
 * Caches written by older service worker versions that may hold user-specific
 * API responses (the cross-origin API cache and the same-origin /api/ cache).
 * Precache caches are managed by Serwist and must never be listed here.
 */
export const LEGACY_CACHE_NAMES = ["cross-origin", "apis"];

/**
 * True when the request carries user credentials and must never be cached.
 * Presence of the header is enough, even with an empty value: skipping the
 * cache once too often is safer than leaking a private response.
 * @param {{ headers?: { has: (name: string) => boolean } } | null | undefined} request
 * @returns {boolean}
 */
export function hasUserCredentials(request) {
  return Boolean(request?.headers?.has("Authorization"));
}

/**
 * Delete legacy caches one by one. A failure on one cache must not stop the
 * others and must never reject, so service worker activation is not blocked.
 * @param {{ delete: (name: string) => Promise<boolean> }} cacheStorage
 * @returns {Promise<void>}
 */
export async function purgeLegacyCaches(cacheStorage) {
  await Promise.all(
    LEGACY_CACHE_NAMES.map(async (name) => {
      try {
        await cacheStorage.delete(name);
      } catch (err) {
        console.warn("[SW] Failed to delete legacy cache", name, err);
      }
    })
  );
}
