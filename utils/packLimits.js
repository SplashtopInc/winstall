export const PACK_NAME_MAX_LENGTH = 50;
export const PACK_DESCRIPTION_MAX_LENGTH = 300;

/**
 * @param {number} limit
 * @returns {string}
 */
export function publicPackLimitMessage(limit) {
  return `Public pack limit reached (${limit}). Unpublish or delete a pack to continue.`;
}

/**
 * Accept only the quota object's two integers. Anything else is unusable.
 * @param {unknown} body
 * @returns {{ publicCount: number, maxPublic: number } | null}
 */
export function readPublicPackQuota(body) {
  if (!body || typeof body !== "object") return null;
  const { publicCount, maxPublic } = body;
  if (!Number.isInteger(publicCount) || !Number.isInteger(maxPublic)) return null;
  return { publicCount, maxPublic };
}
