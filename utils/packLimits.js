export const PACK_NAME_MAX_LENGTH = 50;
export const PACK_DESCRIPTION_MAX_LENGTH = 300;

export const MAX_PUBLIC_PACKS_PER_USER = 10;

export const PUBLIC_PACK_LIMIT_MESSAGE =
  "Public pack limit reached (10). Unpublish or delete a pack to continue.";

export function countPublicPacksInList(packs) {
  return (packs || []).filter((pack) => pack.visibility === "public").length;
}
