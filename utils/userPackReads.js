const USER_PACK_READS = new Set(["/packs/me", "/packs/me/quota"]);

/**
 * Exact owner reads that must carry a session JWT.
 * A longer path such as /packs/me/other is intentionally excluded.
 * @param {string} method
 * @param {string} pathname
 */
export function requiresUserPackReadJwt(method, pathname) {
  return method === "GET" && USER_PACK_READS.has(pathname);
}
