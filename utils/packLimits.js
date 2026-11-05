export const PACK_NAME_MAX_LENGTH = 50;
export const PACK_DESCRIPTION_MAX_LENGTH = 300;

export const MAX_PUBLIC_PACKS_PER_USER = 10;
export const MAX_PUBLIC_PACKS_FOR_TRENDING_OWNER = 200;

/**
 * Public-pack cap for a signed-in user. A blank ops id is never a match.
 * @param {unknown} userId
 * @param {unknown} ownerUserId
 * @returns {number}
 */
export function publicPackLimitForUser(userId, ownerUserId) {
  const owner = ownerUserId == null ? "" : String(ownerUserId).trim();
  if (!owner) return MAX_PUBLIC_PACKS_PER_USER;
  if (userId === owner) return MAX_PUBLIC_PACKS_FOR_TRENDING_OWNER;
  return MAX_PUBLIC_PACKS_PER_USER;
}

/**
 * @param {number} limit
 * @returns {string}
 */
export function publicPackLimitMessage(limit) {
  return `Public pack limit reached (${limit}). Unpublish or delete a pack to continue.`;
}

export function countPublicPacksInList(packs) {
  return (packs || []).filter((pack) => pack.visibility === "public").length;
}
