const PACK_TRENDING_OWNER_META_NAME = "winstall-pack-trending-owner";

/**
 * Trim the ops account id. Blank config is an empty string, never a user id.
 * @param {unknown} value
 * @returns {string}
 */
export function packTrendingOwnerFromValue(value) {
  if (value == null) return "";
  return String(value).trim();
}

/**
 * Meta content for pages/_document.js. Reads the runtime env, not NEXT_PUBLIC_*.
 * @returns {string}
 */
export function packTrendingOwnerMetaContent() {
  return packTrendingOwnerFromValue(process.env.PACK_TRENDING_OWNER_USER_ID);
}

/**
 * Ops account id for the public-pack cap. Browser reads the meta tag.
 * Server reads the same env used to write that tag.
 * @returns {string}
 */
export function readPackTrendingOwnerUserId() {
  if (typeof window !== "undefined") {
    const content = document
      .querySelector(`meta[name="${PACK_TRENDING_OWNER_META_NAME}"]`)
      ?.getAttribute("content");
    return packTrendingOwnerFromValue(content);
  }
  return packTrendingOwnerMetaContent();
}
