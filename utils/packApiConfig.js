/**
 * Feature flag: route Pack CRUD/lists/SSR through winstall-api (via BFF or server AuthKey).
 * Client needs NEXT_PUBLIC_*; server also accepts PACK_API_VIA_WINSTALL.
 * Default off until production cutover after API data migration.
 */
export function isPackApiViaWinstall() {
  return (
    process.env.NEXT_PUBLIC_PACK_API_VIA_WINSTALL === "1" ||
    process.env.PACK_API_VIA_WINSTALL === "1"
  );
}
